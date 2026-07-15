import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { verifyJwt } from '../jwt';

declare module 'fastify' {
  interface FastifyRequest {
    accountNumber: string;
  }
}

function parseCookies(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const pair of header.split(';')) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const name = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    if (name) cookies[name] = value;
  }
  return cookies;
}

export const authMiddleware = fp(async function authMiddleware(app: FastifyInstance) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const cookieHeader = request.headers.cookie || '';
    const cookies = parseCookies(cookieHeader);
    const token = cookies['token'];

    if (!token) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    try {
      const payload = verifyJwt(token, secret);
      request.accountNumber = payload.sub;
    } catch {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
  });
});
