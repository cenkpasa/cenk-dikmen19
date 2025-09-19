import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/contexts': path.resolve(__dirname, 'contexts'),
      '@/pages': path.resolve(__dirname, 'pages'),
      '@/services': path.resolve(__dirname, 'services'),
      '@/utils': path.resolve(__dirname, 'utils'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/constants': path.resolve(__dirname, 'constants'),
      '@/types': path.resolve(__dirname, 'types'),
    }
  }
});