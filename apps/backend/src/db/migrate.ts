import type { Database } from "./client";

const migrateDatabase = async (database: Database): Promise<void> => {
  await database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS titles (
      id TEXT PRIMARY KEY,
      external_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      media_type TEXT NOT NULL,
      release_year INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS expectations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title_id TEXT NOT NULL REFERENCES titles(id),
      score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title_id TEXT NOT NULL REFERENCES titles(id),
      score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
      review TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export { migrateDatabase };
