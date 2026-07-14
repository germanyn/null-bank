import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'transferMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './TransferApp': './src/App.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 4201,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
  },
});
