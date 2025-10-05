// src/client/config.js
// API base for hosted mode (Monday Code). Prefer Vite env, fallback to window injection or same-origin.
export const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') ||
  (typeof window !== 'undefined' && window.__MONDAY_SERVER_BASE__) ||
  '';
