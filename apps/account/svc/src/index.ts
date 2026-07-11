import { buildApp } from './app';
import { createDb } from './db';
import { connectEventBus } from './event-bus';
import { registerAccountEventHandlers } from './event-handlers';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = createDb(path.join(dataDir, 'accounts.db'));

const app = buildApp(db);

const start = async () => {
  try {
    const eventBus = await connectEventBus(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
    registerAccountEventHandlers(db, eventBus);

    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Account service running on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
