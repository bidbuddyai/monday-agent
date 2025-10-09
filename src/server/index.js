require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mondaySdk = require('monday-sdk-js');
const { Storage } = require('@mondaycom/apps-sdk');

const server = express();

// Initialize Monday secure storage
const storage = new Storage();

// Cache for secrets to avoid repeated API calls
const secretsCache = new Map();

// Helper function to get secrets from Monday's secure storage
async function getSecret(key) {
  try {
    // Check cache first
    if (secretsCache.has(key)) {
      return secretsCache.get(key);
    }
    
    // Try environment variable first (for local development)
    if (process.env[key]) {
      secretsCache.set(key, process.env[key]);
      return process.env[key];
    }
    
    // Get from Monday secure storage
    const secret = await storage.get(key);
    if (secret) {
      secretsCache.set(key, secret);
      return secret;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to get secret ${key}:`, error);
    return null;
  }
}

// Make getSecret available globally for routes
global.getSecret = getSecret;
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
server.use('/api', require('./routes/upload'));

server.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.1.0' });
});

server.get('/debug/env', async (_req, res) => {
  let secretApiKey = null;
  try {
    secretApiKey = await getSecret('POE_API_KEY');
  } catch (error) {
    console.error('Error getting secret:', error);
  }
  
  res.json({
    hasEnvApiKey: !!process.env.POE_API_KEY,
    hasSecretApiKey: !!secretApiKey,
    envApiKeyLength: process.env.POE_API_KEY ? process.env.POE_API_KEY.length : 0,
    secretApiKeyLength: secretApiKey ? secretApiKey.length : 0,
    nodeEnv: process.env.NODE_ENV,
    hasStorage: !!storage,
    allEnvKeys: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('TOKEN')).sort()
  });
});

server.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err?.message });
});

module.exports = server;
