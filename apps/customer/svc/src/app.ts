import Fastify from 'fastify';
import cors from '@fastify/cors';
import Database from 'better-sqlite3';
import { customerRoutes } from './routes/customers';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database;
  }
}

export function buildApp(db: Database.Database) {
  const app = Fastify({ logger: false });

  app.register(cors);

  app.decorate('db', db);

  app.register(customerRoutes);

  return app;
}
