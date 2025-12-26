import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const srcPath = path.resolve(__dirname, 'src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(srcPath, 'components'),
      '@contexts': path.resolve(srcPath, 'contexts'),
      '@hooks': path.resolve(srcPath, 'hooks'),
      '@pages': path.resolve(srcPath, 'pages'),
      '@services': path.resolve(srcPath, 'services'),
      '@utils': path.resolve(srcPath, 'utils'),
      '@assets': path.resolve(srcPath, 'assets'),
    },
  },
});
