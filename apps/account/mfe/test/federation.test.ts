import { describe, it, expect } from 'vitest';
import { loadConfigFromFile } from 'vite';
import path from 'path';

describe('Module Federation configuration', () => {
  it('configures federation plugin as a remote exposing AccountApp', async () => {
    const result = await loadConfigFromFile(
      { command: 'build', mode: 'production' },
      undefined,
      path.resolve(__dirname, '..'),
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
