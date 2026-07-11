import { buildApp } from './app';
import { createDb } from './db';
import { connectEventBus } from './event-bus';
import { registerTransferEventHandlers } from './event-handlers';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = createDb(path.join(dataDir, 'transfers.db'));
const eventBus = await connectEventBus(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');

registerTransferEventHandlers(db, eventBus);

const app = buildApp(db, eventBus);

const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Transfer service running on http://localhost:3001');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
