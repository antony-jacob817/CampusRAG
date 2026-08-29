const { Pinecone } = require('@pinecone-database/pinecone');
const env = require('./env');

// In-Memory Vector Store implementation with Cosine Similarity
class InMemoryVectorStore {
  constructor() {
    // Map: namespace -> Array of { id, values: number[], metadata: object }
    this.namespaces = new Map();
    console.log('[VectorDB] In-Memory Vector Store Initialized with Cosine Similarity Support');
  }

  getNamespace(namespace = 'general') {
    const ns = namespace.toLowerCase();
    if (!this.namespaces.has(ns)) {
      this.namespaces.set(ns, []);
    }
    return this.namespaces.get(ns);
  }

  dotProduct(a, b) {
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * (b[i] || 0);
    }
    return dot;
  }

  magnitude(a) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += a[i] * a[i];
    }
    return Math.sqrt(sum) || 1e-10;
  }

  cosineSimilarity(a, b) {
    if (!a || !b || a.length === 0 || b.length === 0) return 0;
    const dot = this.dotProduct(a, b);
    const magA = this.magnitude(a);
    const magB = this.magnitude(b);
    const rawCos = dot / (magA * magB);

    // If vectors are sparse (offline hash embeddings), calibrate to 0.0 - 1.0 scale
    let nonZeroCountA = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== 0) nonZeroCountA++;
    }
    const isSparse = (nonZeroCountA / a.length) < 0.4;

    if (isSparse && rawCos > 0) {
      // Map sparse overlap into standard calibrated 0.0 - 1.0 confidence space
      // Matching documents with rawCos >= 0.16 will score >= 0.67 (grounded)
      // Unrelated queries with rawCos <= 0.05 will score <= 0.21 (ungrounded)
      const calibrated = Math.min(1.0, rawCos * 4.2);
      return Number(calibrated.toFixed(4));
    }

    return Number(rawCos.toFixed(4));
  }

  async upsert(namespace = 'general', vectors = []) {
    const store = this.getNamespace(namespace);
    for (const vec of vectors) {
      const existingIdx = store.findIndex((v) => v.id === vec.id);
      if (existingIdx >= 0) {
        store[existingIdx] = vec;
      } else {
        store.push(vec);
      }
    }
    return { upsertedCount: vectors.length };
  }

  async query(namespace = 'general', queryVector, topK = 4, minScore = 0.0) {
    let candidates = [];
    const nsList = namespace === 'all' 
      ? Array.from(this.namespaces.keys()) 
      : [namespace.toLowerCase()];

    for (const ns of nsList) {
      const store = this.getNamespace(ns);
      for (const item of store) {
        const score = this.cosineSimilarity(queryVector, item.values);
        if (score >= minScore) {
          candidates.push({
            id: item.id,
            score,
            metadata: item.metadata,
            namespace: ns,
          });
        }
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, topK);
  }

  async deleteByDocumentId(documentId) {
    let deletedCount = 0;
    for (const [ns, store] of this.namespaces.entries()) {
      const initialLen = store.length;
      const filtered = store.filter((v) => v.metadata?.documentId?.toString() !== documentId.toString());
      this.namespaces.set(ns, filtered);
      deletedCount += initialLen - filtered.length;
    }
    return { deletedCount };
  }

  getStats() {
    const stats = {};
    let totalVectors = 0;
    for (const [ns, store] of this.namespaces.entries()) {
      stats[ns] = store.length;
      totalVectors += store.length;
    }
    return {
      provider: 'in-memory',
      totalVectors,
      namespaces: stats,
    };
  }
}

let pineconeClient = null;
let inMemoryStore = new InMemoryVectorStore();

const initVectorDb = () => {
  if (env.PINECONE_API_KEY) {
    try {
      pineconeClient = new Pinecone({
        apiKey: env.PINECONE_API_KEY,
      });
      console.log('[VectorDB] Pinecone client initialized successfully');
    } catch (err) {
      console.warn(`[VectorDB] Failed to init Pinecone: ${err.message}. Using In-Memory fallback.`);
      pineconeClient = null;
    }
  } else {
    console.log('[VectorDB] PINECONE_API_KEY not provided. Active Provider: In-Memory Vector Store');
  }
};

const getVectorClient = () => {
  return {
    client: pineconeClient,
    inMemoryStore,
    isUsingPinecone: !!pineconeClient,
  };
};

module.exports = {
  initVectorDb,
  getVectorClient,
  inMemoryStore,
};
