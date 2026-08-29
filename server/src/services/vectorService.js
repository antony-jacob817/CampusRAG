const { getVectorClient, inMemoryStore } = require('../config/vectorDb');
const env = require('../config/env');

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

  if (isUsingPinecone && client && env.PINECONE_INDEX && ns !== 'all') {
    try {
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
    } catch (err) {
      console.warn(`[VectorService] Pinecone query failed: ${err.message}. Falling back to in-memory vector query.`);
    }
  }

  // In-Memory vector query
  return inMemoryStore.query(ns, queryVector, topK, minScore);
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
