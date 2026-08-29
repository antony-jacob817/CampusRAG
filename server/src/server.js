const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { connectDB, getDbStatus } = require('./config/db');
const { initVectorDb, getVectorClient } = require('./config/vectorDb');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { seedInitialData } = require('./scripts/seed');

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration bounded to CLIENT_URL
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 || 
        process.env.NODE_ENV === 'development' ||
        origin.endsWith('.vercel.app') ||
        origin.includes('vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by CORS.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// Compression & Body Parsers
app.use(compression());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  const vectorClient = getVectorClient();

  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusRAG API',
    database: dbStatus,
    vectorStore: {
      provider: vectorClient.isUsingPinecone ? 'Pinecone Serverless' : 'In-Memory Cosine Similarity Store',
      connected: true,
    },
    aiProvider: env.GEMINI_API_KEY
      ? 'Google Gemini (gemini-3.7-flash / gemini-2.5-flash & gemini-embedding-001)'
      : env.OPENROUTER_API_KEY
      ? 'OpenRouter'
      : 'Local Grounded Synthesizer (Zero-dependency Mode)',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Server Startup
const startServer = async () => {
  try {
    await connectDB();
    initVectorDb();

    // Auto-seed campus policy knowledge base and demo accounts
    await seedInitialData();

    const server = app.listen(env.PORT, () => {
      console.log(`=================================================`);
      console.log(`  CampusRAG Server running on port ${env.PORT}`);
      console.log(`  Environment: ${env.NODE_ENV}`);
      console.log(`  Client Origin: ${env.CLIENT_URL}`);
      console.log(`  Health Check: http://localhost:${env.PORT}/api/health`);
      console.log(`=================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[FATAL] Port ${env.PORT} is already in use by another running process.`);
        console.error(`To free port ${env.PORT}, stop the existing server or terminate the background process.\n`);
      } else {
        console.error('[FATAL] Server listener error:', err);
      }
      process.exit(1);
    });

    // Graceful process termination
    const handleShutdown = () => {
      server.close(() => {
        process.exit(0);
      });
    };
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
