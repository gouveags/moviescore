import path from "node:path";
import { mkdirSync } from "node:fs";
import { createClient, type Client as LibsqlClient } from "@libsql/client";
import { Pool } from "pg";
import type { DatabaseConfig } from "./config";

type Database =
  | {
      client: "sqlite";
      run: (query: string, params?: SqlParam[]) => Promise<void>;
      query: <TRow>(query: string, params?: SqlParam[]) => Promise<TRow[]>;
      close: () => Promise<void>;
      raw: LibsqlClient;
    }
  | {
      client: "postgres";
      run: (query: string, params?: SqlParam[]) => Promise<void>;
      query: <TRow>(query: string, params?: SqlParam[]) => Promise<TRow[]>;
      close: () => Promise<void>;
      raw: Pool;
    };

type SqlParam = string | number | boolean | bigint | null | Uint8Array;

const createDatabase = (config: DatabaseConfig): Database => {
  if (config.client === "sqlite") {
    const sqliteUrl = toSqliteUrl(config.sqlitePath);
    const raw = createClient({ url: sqliteUrl });

    return {
      client: "sqlite",
      run: async (query: string, params: SqlParam[] = []) => {
        await raw.execute(query, params);
      },
      query: async <TRow>(query: string, params: SqlParam[] = []) => {
        const result = await raw.execute(query, params);
        return result.rows as TRow[];
      },
      close: async () => {
        raw.close();
      },
      raw,
    };
  }

  const raw = new Pool({
    connectionString: config.databaseUrl,
  });

  return {
    client: "postgres",
    run: async (query: string, params: SqlParam[] = []) => {
      const statement = toPostgresPlaceholders(query);
      await raw.query(statement, params);
    },
    query: async <TRow>(query: string, params: SqlParam[] = []) => {
      const statement = toPostgresPlaceholders(query);
      const result = await raw.query(statement, params);
      return result.rows as TRow[];
    },
    close: async () => {
      await raw.end();
    },
    raw,
  };
};

const closeDatabase = async (database: Database): Promise<void> => database.close();

const toSqliteUrl = (sqlitePath: string): string => {
  if (sqlitePath === ":memory:") {
    return "file::memory:?cache=shared";
  }

  ensureSqliteDirectory(sqlitePath);
  const absolutePath = path.resolve(sqlitePath);
  return `file:${absolutePath}`;
};

const ensureSqliteDirectory = (sqlitePath: string): void => {
  const directory = path.dirname(sqlitePath);
  mkdirSync(directory, { recursive: true });
};

const toPostgresPlaceholders = (query: string): string => {
  let index = 0;
  return query.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
};

export { createDatabase, closeDatabase };
export type { Database };
