import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('transfer-mfe vite config', () => {
  const configPath = resolve(__dirname, '../vite.config.ts');
  const configContent = readFileSync(configPath, 'utf-8');

  it('uses @module-federation/vite', () => {
    expect(configContent).toContain('@module-federation/vite');
  });

  it('exposes ./TransferApp as a Module Federation remote', () => {
    expect(configContent).toContain('./TransferApp');
  });

  it('configures a remote entry filename', () => {
    expect(configContent).toContain("filename: 'remoteEntry.js'");
  });
});
