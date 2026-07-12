import Database from 'better-sqlite3';

export function createDb(dbPath: string = ':memory:'): Database.Database {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cpf_cnpj TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('INDIVIDUAL', 'LEGAL_ENTITY')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}
