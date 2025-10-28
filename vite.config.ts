import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  plugins: [
    react(),
    {
      name: 'enforce-api-base-https',
      apply: 'build',
      buildStart() {
        const base = process.env.VITE_API_BASE || '';
        if (base && !base.startsWith('https://')) {
          this.error('VITE_API_BASE must start with https://');
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE ?? 'http://localhost:5287',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: true,
  },
}));
