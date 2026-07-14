import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'customerMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './CustomerApp': './src/App',
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
