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
    expect(federationConfig.remotes['account-mfe']).toBe(
      'http://localhost:4300/assets/remoteEntry.js',
    );
  });

  it('points customer-mfe to localhost:4400', () => {
    expect(federationConfig.remotes['customer-mfe']).toBe(
      'http://localhost:4400/assets/remoteEntry.js',
    );
  });

  it('points transfer-mfe to localhost:4500', () => {
    expect(federationConfig.remotes['transfer-mfe']).toBe(
      'http://localhost:4500/assets/remoteEntry.js',
    );
  });

  it('shares react and react-dom', () => {
    expect(federationConfig.shared).toContain('react');
    expect(federationConfig.shared).toContain('react-dom');
  });
});
