const pdfParse = require('pdf-parse');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const { generateBatchEmbeddings } = require('./embeddingService');
const { upsertChunksToVectorDb, deleteVectorsByDocumentId, normalizeNamespace } = require('./vectorService');
const { isInMemoryFallback } = require('../config/db');

// In-Memory Document cache for offline / fallback mode
const inMemoryDocs = global.__inMemoryDocs || new Map();
const inMemoryChunks = global.__inMemoryChunks || new Map();
global.__inMemoryDocs = inMemoryDocs;
global.__inMemoryChunks = inMemoryChunks;

/**
 * Split text using RecursiveCharacterTextSplitter with safety fallback
 */
const splitDocumentText = async (rawText, chunkSize = 1000, chunkOverlap = 200) => {
  // Clean raw text and remove null characters or problematic control codes
  const sanitized = rawText
    .replace(/\0/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (!sanitized) {
    return [];
  }

  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' ', ''],
    });
    const chunks = await splitter.splitText(sanitized);
    return chunks.filter((c) => c.trim().length > 20);
  } catch (err) {
    console.warn(`[DocumentService] LangChain splitter warning: ${err.message}. Using fallback regex chunker.`);
    // Safe chunker fallback
    const chunks = [];
    let start = 0;
    while (start < sanitized.length) {
      const end = Math.min(start + chunkSize, sanitized.length);
      const chunk = sanitized.substring(start, end);
      if (chunk.trim().length > 20) {
        chunks.push(chunk.trim());
      }
      start += chunkSize - chunkOverlap;
    }
    return chunks;
  }
};

/**
 * Process and Ingest PDF Buffer
 */
const ingestPdfDocument = async ({
  buffer,
  originalName,
  title,
  department = 'general',
  user,
}) => {
  const dept = normalizeNamespace(department);
  const docId = uuidv4();
  const docTitle = title?.trim() || originalName.replace(/\.pdf$/i, '');

  console.log(`[DocumentService] Ingesting document: "${docTitle}" for department: ${dept}`);

  let mongoDoc = null;
  if (!isInMemoryFallback()) {
    mongoDoc = await Document.create({
      title: docTitle,
      department: dept,
      fileName: originalName,
      fileSize: buffer?.length || 0,
      status: 'chunking',
      uploadedBy: user?._id || user?.id,
      uploaderName: user?.name || 'Admin',
    });
  } else {
    mongoDoc = {
      _id: docId,
      id: docId,
      title: docTitle,
      department: dept,
      fileName: originalName,
      fileSize: buffer?.length || 0,
      totalChunks: 0,
      totalPages: 1,
      status: 'chunking',
      uploaderName: user?.name || 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDocs.set(docId, mongoDoc);
  }

  const effectiveDocId = mongoDoc._id ? mongoDoc._id.toString() : docId;

  try {
    // 1. Extract text using pdf-parse
    let parsedPdf = { text: '', numpages: 1 };
    try {
      parsedPdf = await pdfParse(buffer);
    } catch (parseErr) {
      throw new Error(`Failed to parse PDF binary: ${parseErr.message}`);
    }

    const rawText = parsedPdf.text || '';
    const totalPages = parsedPdf.numpages || 1;

    if (!rawText.trim()) {
      throw new Error('The uploaded PDF contains no readable text or is an empty/image-only document.');
    }

    // 2. Chunk text
    const textChunks = await splitDocumentText(rawText, 1000, 200);

    if (textChunks.length === 0) {
      throw new Error('No valid text chunks could be generated from the document.');
    }

    // Update status to embedding
    if (!isInMemoryFallback()) {
      await Document.findByIdAndUpdate(effectiveDocId, {
        status: 'embedding',
        totalChunks: textChunks.length,
        totalPages,
      });
    } else {
      mongoDoc.status = 'embedding';
      mongoDoc.totalChunks = textChunks.length;
      mongoDoc.totalPages = totalPages;
    }

    // 3. Generate Embeddings for Chunks
    const embeddings = await generateBatchEmbeddings(textChunks);

    // 4. Construct Vector Records and Database Chunk records
    const vectorRecords = [];
    const dbChunkDocs = [];

    const approxCharsPerPage = Math.max(Math.floor(rawText.length / totalPages), 500);

    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i];
      const vectorId = `${effectiveDocId}_chunk_${i}`;
      const approxCharIndex = i * 800;
      const estimatedPage = Math.min(Math.floor(approxCharIndex / approxCharsPerPage) + 1, totalPages);

      vectorRecords.push({
        id: vectorId,
        values: embeddings[i],
        metadata: {
          documentId: effectiveDocId,
          title: docTitle,
          department: dept,
          pageNumber: estimatedPage,
          chunkIndex: i,
          chunkText: chunkText,
        },
      });

      dbChunkDocs.push({
        documentId: effectiveDocId,
        chunkIndex: i,
        text: chunkText,
        pageNumber: estimatedPage,
        vectorId,
        department: dept,
        metadata: {
          title: docTitle,
        },
      });
    }

    // 5. Upsert to Vector Database
    await upsertChunksToVectorDb({
      namespace: dept,
      vectors: vectorRecords,
    });

    // 6. Persist Chunks in MongoDB / Memory
    if (!isInMemoryFallback()) {
      await DocumentChunk.insertMany(dbChunkDocs);
      await Document.findByIdAndUpdate(effectiveDocId, {
        status: 'indexed',
      });
    } else {
      inMemoryChunks.set(effectiveDocId, dbChunkDocs);
      mongoDoc.status = 'indexed';
    }

    console.log(`[DocumentService] Successfully indexed "${docTitle}" with ${textChunks.length} chunks.`);

    return {
      id: effectiveDocId,
      title: docTitle,
      department: dept,
      totalPages,
      totalChunks: textChunks.length,
      status: 'indexed',
    };
  } catch (err) {
    console.error(`[DocumentService] Document ingestion failed for "${docTitle}":`, err);
    if (!isInMemoryFallback()) {
      await Document.findByIdAndUpdate(effectiveDocId, {
        status: 'failed',
        errorMessage: err.message,
      });
    } else {
      mongoDoc.status = 'failed';
      mongoDoc.errorMessage = err.message;
    }
    throw err;
  }
};

/**
 * List all indexed documents
 */
const listDocuments = async ({ department, search }) => {
  if (isInMemoryFallback()) {
    let docs = Array.from(inMemoryDocs.values());
    if (department && department !== 'all') {
      docs = docs.filter((d) => d.department === department);
    }
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter((d) => d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q));
    }
    return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const query = {};
  if (department && department !== 'all') {
    query.department = department;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { fileName: { $regex: search, $options: 'i' } },
    ];
  }

  return Document.find(query).sort({ createdAt: -1 });
};

/**
 * Delete Document and associated vectors/chunks
 */
const deleteDocument = async (documentId) => {
  // Delete vectors
  await deleteVectorsByDocumentId(documentId);

  if (isInMemoryFallback()) {
    inMemoryDocs.delete(documentId);
    inMemoryChunks.delete(documentId);
    return { success: true, message: 'Document deleted from in-memory knowledge store.' };
  }

  await DocumentChunk.deleteMany({ documentId });
  const result = await Document.findByIdAndDelete(documentId);

  if (!result) {
    throw new Error('Document not found.');
  }

  return { success: true, message: 'Document and associated vectors deleted successfully.' };
};

/**
 * Ingest Raw Text directly (for seeding default campus policies)
 */
const ingestRawTextDocument = async ({ title, department, text, totalPages = 1 }) => {
  const dept = normalizeNamespace(department);
  const docId = uuidv4();

  let mongoDoc = null;
  if (!isInMemoryFallback()) {
    mongoDoc = await Document.create({
      title,
      department: dept,
      fileName: `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: Buffer.byteLength(text, 'utf8'),
      totalPages,
      status: 'chunking',
      uploaderName: 'Campus Registrar AI',
    });
  } else {
    mongoDoc = {
      _id: docId,
      id: docId,
      title,
      department: dept,
      fileName: `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: Buffer.byteLength(text, 'utf8'),
      totalPages,
      totalChunks: 0,
      status: 'chunking',
      uploaderName: 'Campus Registrar AI',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryDocs.set(docId, mongoDoc);
  }

  const effectiveDocId = mongoDoc._id ? mongoDoc._id.toString() : docId;

  const textChunks = await splitDocumentText(text, 1000, 200);
  const embeddings = await generateBatchEmbeddings(textChunks);

  const vectorRecords = [];
  const dbChunkDocs = [];

  const approxCharsPerPage = Math.max(Math.floor(text.length / totalPages), 500);

  for (let i = 0; i < textChunks.length; i++) {
    const chunkText = textChunks[i];
    const vectorId = `${effectiveDocId}_chunk_${i}`;
    const approxCharIndex = i * 800;
    const estimatedPage = Math.min(Math.floor(approxCharIndex / approxCharsPerPage) + 1, totalPages);

    vectorRecords.push({
      id: vectorId,
      values: embeddings[i],
      metadata: {
        documentId: effectiveDocId,
        title,
        department: dept,
        pageNumber: estimatedPage,
        chunkIndex: i,
        chunkText: chunkText,
      },
    });

    dbChunkDocs.push({
      documentId: effectiveDocId,
      chunkIndex: i,
      text: chunkText,
      pageNumber: estimatedPage,
      vectorId,
      department: dept,
      metadata: {
        title,
      },
    });
  }

  await upsertChunksToVectorDb({
    namespace: dept,
    vectors: vectorRecords,
  });

  if (!isInMemoryFallback()) {
    await DocumentChunk.insertMany(dbChunkDocs);
    await Document.findByIdAndUpdate(effectiveDocId, {
      totalChunks: textChunks.length,
      status: 'indexed',
    });
  } else {
    inMemoryChunks.set(effectiveDocId, dbChunkDocs);
    mongoDoc.totalChunks = textChunks.length;
    mongoDoc.status = 'indexed';
  }

  return { id: effectiveDocId, title, totalChunks: textChunks.length };
};

module.exports = {
  ingestPdfDocument,
  ingestRawTextDocument,
  listDocuments,
  deleteDocument,
  splitDocumentText,
};
