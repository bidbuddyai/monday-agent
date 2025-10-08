// src/client/config.js
// API base for hosted mode (Monday Code)
// In Monday Code, client and server are on the same domain, so we use relative paths
export const API_BASE = '';

// For local development, you can set VITE_API_URL=http://localhost:8080
if (import.meta.env && import.meta.env.VITE_API_URL) {
  // Development mode override
}
