import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// Fix: Added import for fileURLToPath to resolve __dirname issue in ESM.
import { fileURLToPath } from 'url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
// Fix: Replaced __dirname with a cross-platform compatible way to get the current directory in an ES module.
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src')
    },
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
  },
});
