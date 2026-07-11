import Fastify from 'fastify';
import cors from '@fastify/cors';
import Database from 'better-sqlite3';
import { transferRoutes } from './routes/transfers';
import { EventBus } from './event-bus';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database;
    eventBus: EventBus;
  }
}

export function buildApp(db: Database.Database, eventBus: EventBus) {
  const app = Fastify({ logger: false });

  app.register(cors);

  app.decorate('db', db);
  app.decorate('eventBus', eventBus);

  app.register(transferRoutes);

  return app;
}
