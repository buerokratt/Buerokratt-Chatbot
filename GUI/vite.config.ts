import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { removeHiddenMenuItems } from './vitePlugin';

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'REACT_APP_',
  plugins: [
    react(),
    tsconfigPaths(),
    svgr(),
    {
      name: 'removeHiddenMenuItemsPlugin',
      transform: (str, id) => {
        if(!id.endsWith('/menu-structure.json'))
          return str;
        return removeHiddenMenuItems(str);
      },
    },
  ],
  base: 'chat',
  build: {
    outDir: './build',
    target: 'es2015',
    emptyOutDir: true,
  },
  server: {
    headers: {
      ...(process.env.REACT_APP_CSP && {
        'Content-Security-Policy': process.env.REACT_APP_CSP,
      }),
    },
  },
  resolve: {
    alias: {
      '~@fontsource': path.resolve(__dirname, 'node_modules/@fontsource'),
      '@': `${path.resolve(__dirname, './src')}`,
    },
  },
});
