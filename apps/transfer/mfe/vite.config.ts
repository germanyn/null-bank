import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'transfer-mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './TransferApp': './src/App',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: Number(process.env.TRANSFER_MFE_PORT ?? 4500),
    origin: `http://localhost:${process.env.TRANSFER_MFE_PORT ?? 4500}`,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
  },
});
