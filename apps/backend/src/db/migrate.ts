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

  await database.run(`
    CREATE TABLE IF NOT EXISTS auth_users (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      password_hash TEXT NOT NULL,
      mfa_secret_encrypted TEXT,
      mfa_enabled INTEGER NOT NULL DEFAULT 0,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      access_token_hash TEXT NOT NULL UNIQUE,
      refresh_token_hash TEXT NOT NULL UNIQUE,
      access_expires_at TEXT NOT NULL,
      refresh_expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS auth_password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.run(`
    CREATE TABLE IF NOT EXISTS auth_recovery_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      code_hash TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.run(`
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
    ON auth_sessions (user_id)
  `);

  await database.run(`
    CREATE INDEX IF NOT EXISTS idx_auth_recovery_codes_user_id
    ON auth_recovery_codes (user_id)
  `);
};

export { migrateDatabase };
