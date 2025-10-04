import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const rootDir = resolve(__dirname, 'src', 'client');

export default defineConfig({
  root: rootDir,
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    allowedHosts: (() => {
      const hosts = ['localhost', '127.0.0.1'];
      if (process.env.FRONTEND_TUNNEL_HOST) {
        hosts.push(process.env.FRONTEND_TUNNEL_HOST);
      }
      return hosts;
    })(),
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3000,
    strictPort: true
  },
  build: {
    outDir: resolve(__dirname, 'build', 'client'),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: resolve(rootDir, 'index.html')
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src', 'client')
    }
  }
});
