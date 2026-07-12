import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app';
import { createDb } from '../src/db';
import Database from 'better-sqlite3';

describe('Account Service', () => {
  const db = createDb();
  const app = buildApp(db);

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    db.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM accounts');
  });

  describe('POST /accounts', () => {
    it('creates an account with default zero balance', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/accounts',
        payload: {
          cpfCnpj: '11111111111',
          password: 'pass123',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.balance).toBe(0);
    });

    it('returns 409 when CPF/CNPJ already has an account', async () => {
      await app.inject({
        method: 'POST',
        url: '/accounts',
        payload: { cpfCnpj: '12345678901', password: 'pass123' },
      });

      const res = await app.inject({
        method: 'POST',
        url: '/accounts',
        payload: { cpfCnpj: '12345678901', password: 'pass456' },
      });

      expect(res.statusCode).toBe(409);
      expect(JSON.parse(res.body).error).toBe('Account already exists for this CPF/CNPJ');
    });

    it('creates an account and returns account details', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/accounts',
        payload: {
          cpfCnpj: '12345678901',
          password: 'securePass123',
          initialBalance: 1000,
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.accountNumber).toBeDefined();
      expect(body.accountNumber).toHaveLength(10);
      expect(body.cpfCnpj).toBe('12345678901');
      expect(body.balance).toBe(1000);
      expect(body.createdAt).toBeDefined();
    });
  });

  describe('GET /accounts/:accountNumber/balance', () => {
    it('returns the balance for an existing account', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/accounts',
        payload: {
          cpfCnpj: '12345678901',
          password: 'securePass123',
          initialBalance: 500,
        },
      });
      const { accountNumber } = JSON.parse(createRes.body);

      const balanceRes = await app.inject({
        method: 'GET',
        url: `/accounts/${accountNumber}/balance`,
      });

      expect(balanceRes.statusCode).toBe(200);
      const body = JSON.parse(balanceRes.body);
      expect(body.accountNumber).toBe(accountNumber);
      expect(body.balance).toBe(500);
    });

    it('returns 404 for a non-existent account', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/accounts/9999999999/balance',
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /login', () => {
    it('returns account number and token for valid credentials', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/accounts',
        payload: {
          cpfCnpj: '12345678901',
          password: 'securePass123',
        },
      });
      const { accountNumber } = JSON.parse(createRes.body);

      const loginRes = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          accountNumber,
          password: 'securePass123',
        },
      });

      expect(loginRes.statusCode).toBe(200);
      const loginBody = JSON.parse(loginRes.body);
      expect(loginBody.accountNumber).toBe(accountNumber);
      expect(loginBody.token).toBeDefined();
    });

    it('returns 401 for invalid password', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/accounts',
        payload: {
          cpfCnpj: '12345678901',
          password: 'securePass123',
        },
      });
      const { accountNumber } = JSON.parse(createRes.body);

      const loginRes = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          accountNumber,
          password: 'wrongPassword',
        },
      });

      expect(loginRes.statusCode).toBe(401);
    });
  });
});

describe('Port Configuration', () => {
  afterEach(() => {
    delete process.env.ACCOUNT_SVC_PORT;
  });

  it('can start on a custom port', async () => {
    const port = 3999;
    process.env.ACCOUNT_SVC_PORT = String(port);

    const db = createDb();
    const app = buildApp(db);

    await app.ready();
    const address = await app.listen({ port, host: '127.0.0.1' });

    expect(address).toContain(String(port));

    await app.close();
    db.close();
  });

  it('resolves port from ACCOUNT_SVC_PORT env var', () => {
    process.env.ACCOUNT_SVC_PORT = '4123';
    expect(Number(process.env.ACCOUNT_SVC_PORT ?? 3100)).toBe(4123);
  });

  it('falls back to default port 3100 when ACCOUNT_SVC_PORT is unset', () => {
    delete process.env.ACCOUNT_SVC_PORT;
    expect(Number(process.env.ACCOUNT_SVC_PORT ?? 3100)).toBe(3100);
  });
});
