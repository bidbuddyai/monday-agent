require('dotenv').config();
const { createServer } = require('@mondaycom/apps-sdk');
const express = require('express');
const cors = require('cors');

// Initialize Monday server
const server = createServer({
  logLevel: process.env.LOG_LEVEL || 'info'
});

// Middleware
server.use(cors());
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure mondayContext exists (dev/tunnel mode has no signature)
server.use((req, _res, next) => {
  if (!req.mondayContext) req.mondayContext = {};
  next();
});

// Import routes
const poeRoutes = require('./routes/poe');
const boardRoutes = require('./routes/board');

// Mount routes
server.use('/api/poe', poeRoutes);
server.use('/api/board', boardRoutes);

// Health check
server.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.1.0'
  });
});

// Error handling
server.use((error, req, res, next) => {
  void next;
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = server;
