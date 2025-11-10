/**
 * NetShift Backend Server v0.3.0
 * 
 * Production-grade Express server with:
 * - Real SideShift v2 API integration only (no mocks)
 * - MongoDB persistence
 * - Security middleware (Helmet, CORS, rate limiting)
 * - Comprehensive error handling
 */

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import apiRouter from './api/routes.js';
import { CONFIG } from './config/constants.js';
import { corsMiddleware, createRateLimiter, helmetMiddlewares } from './utils/security.js';

const app = express();

// Trust proxy for correct IP detection
app.set('trust proxy', true);

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Security middleware
helmetMiddlewares.forEach(h => app.use(h));
app.use(corsMiddleware);

// Logging
app.use(morgan(CONFIG.nodeEnv === 'production' ? 'combined' : 'dev'));

// Health check
app.get('/health', (_, res) => res.json({ 
  success: true, 
  data: { 
    status: 'ok', 
    version: CONFIG.version 
  } 
}));

// API routes with rate limiting
app.use('/api', createRateLimiter(), apiRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ 
  success: false, 
  error: 'Not found' 
}));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    error: CONFIG.nodeEnv === 'production' ? 'Server error' : err.message 
  });
});

// Start server
(async function start() {
  try {
    // Connect to MongoDB
    if (CONFIG.mongoUri) {
      await mongoose.connect(CONFIG.mongoUri);
      console.log('✅ MongoDB connected');
    }
    
    // Start listening
    app.listen(CONFIG.port, () => {
      console.log(`\n🚀 NetShift backend v${CONFIG.version}`);
      console.log(`📍 http://localhost:${CONFIG.port}`);
      console.log(`🔗 Health: http://localhost:${CONFIG.port}/health`);
      console.log(`🌍 Environment: ${CONFIG.nodeEnv}`);
      console.log(`✅ Ready to accept requests!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

export default app;
