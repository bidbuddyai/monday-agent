import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const rootDir = resolve(__dirname, 'src', 'client');

export default defineConfig({
  root: rootDir,
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true
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
