import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: '@null-bank/account-mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './AccountApp': './src/App',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: Number(process.env.ACCOUNT_MFE_PORT ?? 4300),
  },
  build: {
    target: 'esnext',
  },
});
