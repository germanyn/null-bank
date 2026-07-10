import Database from 'better-sqlite3';

export function createDb(dbPath: string = ':memory:'): Database.Database {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_number TEXT UNIQUE NOT NULL,
      cpf_cnpj TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0,
      token TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}
