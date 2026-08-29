const { getVectorClient, inMemoryStore } = require('../config/vectorDb');
const env = require('../config/env');
const DocumentChunk = require('../models/DocumentChunk');
const { isInMemoryFallback } = require('../config/db');

const VALID_NAMESPACES = ['admissions', 'academics', 'examinations', 'hostel', 'placements', 'general'];

const normalizeNamespace = (dept = 'general') => {
  const normalized = (dept || 'general').toLowerCase().trim();
  if (normalized === 'all') return 'all';
  return VALID_NAMESPACES.includes(normalized) ? normalized : 'general';
};

const upsertChunksToVectorDb = async ({ namespace = 'general', vectors = [] }) => {
  const ns = normalizeNamespace(namespace);
  const { client, isUsingPinecone } = getVectorClient();

  if (isUsingPinecone && client && env.PINECONE_INDEX) {
    try {
      const index = client.index(env.PINECONE_INDEX).namespace(ns);
      const pineconeRecords = vectors.map((v) => ({
        id: v.id,
        values: v.values,
        metadata: {
          documentId: v.metadata.documentId?.toString(),
          title: v.metadata.title,
          department: ns,
          pageNumber: Number(v.metadata.pageNumber || 1),
          chunkIndex: Number(v.metadata.chunkIndex || 0),
          chunkText: v.metadata.chunkText || '',
        },
      }));

      // Pinecone batch upsert (batches of 100)
      const batchSize = 100;
      for (let i = 0; i < pineconeRecords.length; i += batchSize) {
        const batch = pineconeRecords.slice(i, i + batchSize);
        await index.upsert(batch);
      }

      console.log(`[VectorService] Upserted ${vectors.length} vectors to Pinecone namespace: ${ns}`);
      // Also store in in-memory store for instant zero-latency dual fallback
      await inMemoryStore.upsert(ns, vectors);
      return { success: true, count: vectors.length, provider: 'pinecone' };
    } catch (err) {
      console.warn(`[VectorService] Pinecone upsert failed: ${err.message}. Falling back to in-memory vector store.`);
    }
  }

  // In-Memory store fallback
  const result = await inMemoryStore.upsert(ns, vectors);
  return { success: true, count: result.upsertedCount, provider: 'in-memory' };
};

const queryVectorDb = async ({ namespace = 'all', queryVector, topK = 4, minScore = 0.0 }) => {
  const ns = normalizeNamespace(namespace);
  const { client, isUsingPinecone } = getVectorClient();

  if (isUsingPinecone && client && env.PINECONE_INDEX) {
    try {
      if (ns === 'all') {
        const queryPromises = VALID_NAMESPACES.map(async (currNs) => {
          try {
            const index = client.index(env.PINECONE_INDEX).namespace(currNs);
            const queryRes = await index.query({
              vector: queryVector,
              topK,
              includeMetadata: true,
            });
            return (queryRes?.matches || []).map((m) => ({
              id: m.id,
              score: m.score || 0,
              metadata: m.metadata || {},
              namespace: currNs,
            }));
          } catch (e) {
            return [];
          }
        });
        const allMatches = (await Promise.all(queryPromises)).flat();
        allMatches.sort((a, b) => (b.score || 0) - (a.score || 0));
        const filtered = allMatches.filter((m) => (m.score || 0) >= minScore).slice(0, topK);
        if (filtered.length > 0) {
          return filtered;
        }
      } else {
        const index = client.index(env.PINECONE_INDEX).namespace(ns);
        const queryRes = await index.query({
          vector: queryVector,
          topK,
          includeMetadata: true,
        });

        if (queryRes?.matches && queryRes.matches.length > 0) {
          const matches = queryRes.matches
            .filter((m) => (m.score || 0) >= minScore)
            .map((m) => ({
              id: m.id,
              score: m.score || 0,
              metadata: m.metadata || {},
              namespace: ns,
            }));

          if (matches.length > 0) {
            return matches;
          }
        }
      }
    } catch (err) {
      console.warn(`[VectorService] Pinecone query failed: ${err.message}. Trying in-memory / MongoDB fallback.`);
    }
  }

  // In-Memory vector query fallback
  const memMatches = inMemoryStore.query(ns, queryVector, topK, minScore);
  if (memMatches && memMatches.length > 0) {
    return memMatches;
  }

  // MongoDB DocumentChunk fallback
  if (!isInMemoryFallback()) {
    try {
      const filter = ns === 'all' ? {} : { department: ns };
      const chunks = await DocumentChunk.find(filter).populate('documentId').limit(50);
      if (chunks && chunks.length > 0) {
        const scoredChunks = chunks.map((c) => {
          const docTitle = c.metadata?.title || c.documentId?.title || 'Campus Handbook';
          return {
            id: c.vectorId || c._id.toString(),
            score: 0.88,
            metadata: {
              chunkText: c.text,
              title: docTitle,
              department: c.department,
              pageNumber: c.pageNumber || 1,
              chunkIndex: c.chunkIndex || 0,
              documentId: c.documentId?._id?.toString() || c.documentId?.toString() || '',
            },
            namespace: c.department,
          };
        });
        return scoredChunks.slice(0, topK);
      }
    } catch (dbErr) {
      console.warn(`[VectorService] MongoDB chunk fallback warning: ${dbErr.message}`);
    }
  }

  return [];
};

const deleteVectorsByDocumentId = async (documentId) => {
  const { client, isUsingPinecone } = getVectorClient();

  if (isUsingPinecone && client && env.PINECONE_INDEX) {
    try {
      // In Pinecone, delete with filter metadata documentId
      for (const ns of VALID_NAMESPACES) {
        try {
          const index = client.index(env.PINECONE_INDEX).namespace(ns);
          await index.deleteMany({
            filter: { documentId: { $eq: documentId.toString() } },
          });
        } catch (e) {
          // ignore individual namespace deletion error
        }
      }
    } catch (err) {
      console.warn(`[VectorService] Pinecone delete failed: ${err.message}`);
    }
  }

  return inMemoryStore.deleteByDocumentId(documentId);
};

const getVectorStats = () => {
  return inMemoryStore.getStats();
};

module.exports = {
  VALID_NAMESPACES,
  normalizeNamespace,
  upsertChunksToVectorDb,
  queryVectorDb,
  deleteVectorsByDocumentId,
  getVectorStats,
};
