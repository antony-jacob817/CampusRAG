const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

let googleGenAI = null;
if (env.GEMINI_API_KEY) {
  googleGenAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

// Generate deterministic normalized vector for offline/fallback local development
const generateDeterministicEmbedding = (text, dimensions = 768) => {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);
  const vector = new Array(dimensions).fill(0);

  // Hash words into dimensional buckets with frequency & position weighting
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash * 31 + word.charCodeAt(c)) & 0xffffffff;
    }
    
    const primaryIdx = Math.abs(hash) % dimensions;
    const secondaryIdx = Math.abs((hash >> 3) * 17) % dimensions;
    
    vector[primaryIdx] += 1.0 / Math.sqrt(i + 1);
    vector[secondaryIdx] += 0.5 / Math.sqrt(i + 1);

    // Context bigram weighting
    if (i > 0) {
      const bigram = words[i - 1] + '_' + word;
      let bHash = 0;
      for (let c = 0; c < bigram.length; c++) {
        bHash = (bHash * 33 + bigram.charCodeAt(c)) & 0xffffffff;
      }
      const bIdx = Math.abs(bHash) % dimensions;
      vector[bIdx] += 0.75;
    }
  }

  // Normalize to unit vector
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += vector[i] * vector[i];
  }
  const magnitude = Math.sqrt(sumSq) || 1.0;
  return vector.map((val) => val / magnitude);
};

const generateEmbedding = async (text) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return new Array(768).fill(0);
  }

  const sanitizedText = text.trim();

  // Try Google Generative AI (gemini-embedding-001 -> gemini-embedding-2-preview)
  if (env.GEMINI_API_KEY) {
    if (!googleGenAI) {
      googleGenAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }

    const embeddingModels = ['gemini-embedding-001', 'text-embedding-004', 'gemini-embedding-2-preview'];
    for (const modelName of embeddingModels) {
      try {
        const model = googleGenAI.getGenerativeModel({ model: modelName });
        const result = await model.embedContent(sanitizedText);
        if (result?.embedding?.values) {
          return result.embedding.values;
        }
      } catch (error) {
        // Try next embedding model in list
      }
    }
  }

  // Try OpenRouter if configured
  if (env.OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': env.CLIENT_URL,
          'X-Title': 'CampusRAG',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: sanitizedText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.data?.[0]?.embedding) {
          return data.data[0].embedding;
        }
      }
    } catch (err) {
      console.warn(`[EmbeddingService] OpenRouter embeddings failed: ${err.message}. Using deterministic fallback.`);
    }
  }

  // Deterministic local embedding fallback
  return generateDeterministicEmbedding(sanitizedText, 768);
};

const generateBatchEmbeddings = async (texts = []) => {
  const embeddings = [];
  for (const text of texts) {
    const emb = await generateEmbedding(text);
    embeddings.push(emb);
  }
  return embeddings;
};

module.exports = {
  generateEmbedding,
  generateBatchEmbeddings,
  generateDeterministicEmbedding,
};
