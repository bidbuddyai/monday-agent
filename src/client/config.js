// src/client/config.js
// API base for hosted mode (Monday Code)
// The server URL needs to be explicitly set because Published Build (CDN) is on a different domain

// Get server URL from window context injected by Monday Code, or fallback to hardcoded URL
let serverUrl = '';

if (typeof window !== 'undefined') {
  // Monday Code injects the server URL in the window context
  serverUrl = window.mondayServerUrl || window.__MONDAY_SERVER_URL__ || '';
  
  // If no server URL is injected, use the deployed server URL
  if (!serverUrl) {
    // This is the deployed Monday Code server URL for v4
    serverUrl = 'https://eb8fc-service-23730086-e8794d3f.us.monday.app';
  }
}

export const API_BASE = serverUrl;

// For local development override
if (import.meta.env && import.meta.env.VITE_API_URL) {
  console.log('Using dev API URL:', import.meta.env.VITE_API_URL);
}
