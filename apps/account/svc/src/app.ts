import Fastify from 'fastify';
import cors from '@fastify/cors';
import Database from 'better-sqlite3';
import { accountRoutes } from './routes/accounts';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database;
  }
}

export function buildApp(db: Database.Database) {
  const app = Fastify({ logger: false });

  app.register(cors);

  app.decorate('db', db);

  app.register(accountRoutes);

  return app;
}
