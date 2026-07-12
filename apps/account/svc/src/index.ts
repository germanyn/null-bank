import { buildApp } from './app';
import { createDb } from './db';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = createDb(path.join(dataDir, 'accounts.db'));

const app = buildApp(db);

const port = Number(process.env.ACCOUNT_SVC_PORT ?? 3100);

const start = async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Account service running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
