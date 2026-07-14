import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: '@null-bank/customer-mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './CustomerApp': './src/App',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: Number(process.env.CUSTOMER_MFE_PORT ?? 4400),
  },
  build: {
    target: 'esnext',
  },
});
