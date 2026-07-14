import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { federationConfig } from './src/federation.config';

export default defineConfig({
  plugins: [react(), federation(federationConfig)],
  server: {
    port: Number(process.env.SHELL_PORT ?? 5000),
  },
  build: {
    target: 'esnext',
  },
});
