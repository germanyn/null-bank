import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { signJwt } from '../src/jwt';
import { authMiddleware } from '../src/middleware/auth';

const JWT_SECRET = 'test-secret';
const ACCOUNT_NUMBER = '1234567890';

function buildTestApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.register(authMiddleware);
  app.get('/protected', async (request) => {
    return { accountNumber: request.accountNumber };
  });

  return app;
}

describe('Auth Middleware', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;
    app = buildTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.JWT_SECRET;
  });

  it('passes through with a valid token cookie', async () => {
    const token = signJwt({ sub: ACCOUNT_NUMBER }, JWT_SECRET);
    const res = await app.inject({
      method: 'GET',
      url: '/protected',
      cookies: { token },
    });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).accountNumber).toBe(ACCOUNT_NUMBER);
  });

  it('returns 401 when the token cookie is missing', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/protected',
    });

    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).error).toBe('Authentication required');
  });

  it('returns 401 when the token has an invalid signature', async () => {
    const token = signJwt({ sub: ACCOUNT_NUMBER }, 'wrong-secret');
    const res = await app.inject({
      method: 'GET',
      url: '/protected',
      cookies: { token },
    });

    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).error).toBe('Invalid or expired token');
  });

  it('returns 401 when the token is expired', async () => {
    const token = signJwt({ sub: ACCOUNT_NUMBER }, JWT_SECRET, -1);
    const res = await app.inject({
      method: 'GET',
      url: '/protected',
      cookies: { token },
    });

    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).error).toBe('Invalid or expired token');
  });

  it('returns 401 when the token is malformed', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/protected',
      cookies: { token: 'not-a-jwt' },
    });

    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).error).toBe('Invalid or expired token');
  });
});
