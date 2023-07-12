import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'REACT_APP_',
  plugins: [react(), tsconfigPaths(), svgr()],
  base: 'chat',
  build: {
    outDir: './build',
    target: 'es2015',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '~@fontsource': path.resolve(__dirname, 'node_modules/@fontsource'),
      '@': `${path.resolve(__dirname, './src')}`,
    },
  },
});
