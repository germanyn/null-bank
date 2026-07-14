import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['test/federation.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
  },
});
