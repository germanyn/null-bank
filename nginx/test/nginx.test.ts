import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const nginxConfPath = resolve(__dirname, '../nginx.conf.template');
const nginxConf = readFileSync(nginxConfPath, 'utf-8');

describe('nginx reverse proxy configuration', () => {
  it('config file exists', () => {
    expect(nginxConf).toBeDefined();
    expect(nginxConf.length).toBeGreaterThan(0);
  });

  it('listens on NGINX_PORT', () => {
    expect(nginxConf).toMatch(/listen\s+\$\{NGINX_PORT\};/);
  });

  it('routes /api/accounts/ to account-svc on port 3100', () => {
    expect(nginxConf).toMatch(/upstream account-svc/);
    expect(nginxConf).toMatch(/server localhost:3100/);
    expect(nginxConf).toMatch(/location \/api\/accounts\//);
    expect(nginxConf).toMatch(/proxy_pass http:\/\/account-svc\//);
  });

  it('routes /api/transfers/ to transfer-svc on port 3300', () => {
    expect(nginxConf).toMatch(/upstream transfer-svc/);
    expect(nginxConf).toMatch(/server localhost:3300/);
    expect(nginxConf).toMatch(/location \/api\/transfers\//);
    expect(nginxConf).toMatch(/proxy_pass http:\/\/transfer-svc\//);
  });

  it('routes / to shell on port 5000', () => {
    expect(nginxConf).toMatch(/upstream shell/);
    expect(nginxConf).toMatch(/server localhost:5000/);
    expect(nginxConf).toMatch(/location \//);
    expect(nginxConf).toMatch(/proxy_pass http:\/\/shell\//);
  });

  it('forwards X-Forwarded-For header', () => {
    expect(nginxConf).toMatch(/proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for/);
  });

  it('forwards X-Real-IP header', () => {
    expect(nginxConf).toMatch(/proxy_set_header X-Real-IP \$remote_addr/);
  });

  it('forwards X-Forwarded-Proto header', () => {
    expect(nginxConf).toMatch(/proxy_set_header X-Forwarded-Proto \$scheme/);
  });

  it('forwards Host header', () => {
    expect(nginxConf).toMatch(/proxy_set_header Host \$host/);
  });

  it('uses HTTP/1.1 for upstream connections', () => {
    expect(nginxConf).toMatch(/proxy_http_version 1\.1;/);
    expect(nginxConf).toMatch(/proxy_set_header Connection ""/);
  });

  it('does not hide Set-Cookie headers from upstream', () => {
    expect(nginxConf).not.toMatch(/proxy_hide_header Set-Cookie/);
  });
});
