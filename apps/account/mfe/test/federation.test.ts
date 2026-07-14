import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

describe('Module Federation configuration', () => {
  it('exposes AccountApp through the federation plugin', async () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

    const result = await loadConfigFromFile(
      { command: 'build', mode: 'production' },
      undefined,
      root,
    );
    expect(result).not.toBeNull();

    const config = result!.config;
    const flatPlugins = config.plugins?.flat() ?? [];
    const federationPlugin = flatPlugins.find(
      (p: any) => p?.name === 'originjs:federation',
    );
    expect(federationPlugin).toBeDefined();
  });
});
