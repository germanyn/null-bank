import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'account-mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './AccountApp': './src/App',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: Number(process.env.ACCOUNT_MFE_PORT ?? 4300),
    origin: `http://localhost:${process.env.ACCOUNT_MFE_PORT ?? 4300}`,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
  },
});
