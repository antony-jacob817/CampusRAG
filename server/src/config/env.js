require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  JWT_SECRET: process.env.JWT_SECRET || 'campusrag_super_secret_jwt_key_2026_nxtwave',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusrag',
  
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  PINECONE_INDEX: process.env.PINECONE_INDEX || 'campus-rag',
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || 'us-east-1',
};

module.exports = env;
