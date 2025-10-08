require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('@mondaycom/apps-sdk');

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

// Monday Apps SDK middleware for context and signing
const mondayServer = createServer({
  signingSecret: process.env.MONDAY_SIGNING_SECRET
});

server.use((req, res, next) => {
  // Handle Monday SDK context
  mondayServer.middleware(req, res, (error) => {
    if (error) {
      console.error('Monday middleware error:', error);
      // Continue anyway for development
      if (!req.mondayContext) {
        req.mondayContext = {
          mondayClient: null,
          user: null,
          account: null
        };
      }
    }
    next();
  });
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
