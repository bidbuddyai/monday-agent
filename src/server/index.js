require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mondaySdk = require('monday-sdk-js');

const server = express();

// Trust proxy for Monday Code hosting
server.set('trust proxy', 1);

server.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS']
  })
);
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Monday client context middleware
server.use((req, res, next) => {
  // Initialize Monday context
  if (!req.mondayContext) {
    req.mondayContext = {};
  }
  
  // Create Monday client if token is available
  const token = process.env.MONDAY_API_TOKEN || req.headers['x-monday-token'];
  if (token) {
    req.mondayContext.mondayClient = mondaySdk({ token });
  }
  
  next();
});

server.use('/api/poe', require('./routes/poe'));
server.use('/api/board', require('./routes/board'));

server.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.1.0' });
});

server.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err?.message });
});

module.exports = server;
