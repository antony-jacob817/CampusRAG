const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;
let isInMemoryFallback = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    isInMemoryFallback = false;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Connection to ${env.MONGODB_URI} failed: ${error.message}`);
    console.warn('[MongoDB] Initializing In-Memory Datastore Fallback for local development...');
    isInMemoryFallback = true;
    isConnected = true;
  }
};

const getDbStatus = () => {
  return {
    connected: isConnected,
    mode: isInMemoryFallback ? 'in-memory-fallback' : 'mongodb',
    uri: isInMemoryFallback ? 'in-memory' : env.MONGODB_URI,
  };
};

module.exports = { connectDB, getDbStatus, isInMemoryFallback: () => isInMemoryFallback };
