const { generateEmbedding } = require('../services/embeddingService');
const { queryVectorDb } = require('../services/vectorService');

const MIN_SIMILARITY_THRESHOLD = 0.65;

/**
 * Retrieval Agent:
 * Generates embedding for the user prompt, queries the namespace in vector DB,
 * and filters out any chunks below the similarity threshold (0.65).
 */
const retrieveRelevantChunks = async ({
  query,
  department = 'all',
  topK = 4,
  minThreshold = MIN_SIMILARITY_THRESHOLD,
}) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return {
      chunks: [],
      queryVector: [],
      topScore: 0,
      totalRetrieved: 0,
      filteredCount: 0,
    };
  }

  // 1. Generate query embedding vector
  const queryVector = await generateEmbedding(query.trim());

  // 2. Query Vector Store (Pinecone / In-Memory Store)
  const rawResults = await queryVectorDb({
    namespace: department,
    queryVector,
    topK: topK * 2, // Fetch slightly more to filter accurately
    minScore: 0.0,
  });

  // 3. Filter by similarity threshold
  const qualifyingChunks = [];
  let topScore = 0;

  for (const match of rawResults) {
    const score = Number(match.score || 0);
    if (score > topScore) {
      topScore = score;
    }

    if (score >= minThreshold) {
      qualifyingChunks.push({
        id: match.id,
        score: Number(score.toFixed(4)),
        text: match.metadata?.chunkText || '',
        title: match.metadata?.title || 'Campus Notice',
        documentId: match.metadata?.documentId,
        pageNumber: match.metadata?.pageNumber || 1,
        chunkIndex: match.metadata?.chunkIndex || 0,
        department: match.metadata?.department || match.namespace || department,
      });
    }
  }

  // Cap to topK
  const finalChunks = qualifyingChunks.slice(0, topK);

  return {
    chunks: finalChunks,
    queryVector,
    topScore: Number(topScore.toFixed(4)),
    totalRawRetrieved: rawResults.length,
    qualifyingCount: finalChunks.length,
    thresholdUsed: minThreshold,
  };
};

module.exports = {
  retrieveRelevantChunks,
  MIN_SIMILARITY_THRESHOLD,
};
