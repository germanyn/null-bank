import { describe, it, expect } from 'vitest';
import { federationConfig } from '../src/federation.config';

describe('Module Federation host configuration', () => {
  it('configures the shell as the host name', () => {
    expect(federationConfig.name).toBe('shell');
  });

  it('defines remotes for all three microfrontends', () => {
    expect(Object.keys(federationConfig.remotes)).toEqual([
      'account-mfe',
      'customer-mfe',
      'transfer-mfe',
    ]);
  });

  it('points account-mfe to localhost:4300', () => {
    expect(federationConfig.remotes['account-mfe']).toEqual({
      type: 'module',
      name: 'account-mfe',
      entry: 'http://localhost:4300/remoteEntry.js',
    });
  });

  it('points customer-mfe to localhost:4400', () => {
    expect(federationConfig.remotes['customer-mfe']).toEqual({
      type: 'module',
      name: 'customer-mfe',
      entry: 'http://localhost:4400/remoteEntry.js',
    });
  });

  it('points transfer-mfe to localhost:4500', () => {
    expect(federationConfig.remotes['transfer-mfe']).toEqual({
      type: 'module',
      name: 'transfer-mfe',
      entry: 'http://localhost:4500/remoteEntry.js',
    });
  });

  it('shares react and react-dom', () => {
    expect(federationConfig.shared).toContain('react');
    expect(federationConfig.shared).toContain('react-dom');
  });
});
