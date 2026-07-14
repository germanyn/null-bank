import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'customer-mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './CustomerApp': './src/App',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: Number(process.env.CUSTOMER_MFE_PORT ?? 4400),
    origin: `http://localhost:${process.env.CUSTOMER_MFE_PORT ?? 4400}`,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
  },
});
