type DatabaseClient = "sqlite" | "postgres";

type DatabaseConfig =
  | {
      client: "sqlite";
      sqlitePath: string;
    }
  | {
      client: "postgres";
      databaseUrl: string;
    };

type DatabaseEnv = Record<string, string | undefined> & {
  DB_CLIENT?: string;
  SQLITE_PATH?: string;
  DATABASE_URL?: string;
};

const DEFAULT_SQLITE_PATH = "./.data/moviescore.db";

export const resolveDatabaseConfig = (env: DatabaseEnv): DatabaseConfig => {
  const client = normalizeClient(env.DB_CLIENT);

  if (client === "postgres") {
    if (!env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required when DB_CLIENT=postgres");
    }

    return {
      client: "postgres",
      databaseUrl: env.DATABASE_URL,
    };
  }

  return {
    client: "sqlite",
    sqlitePath: env.SQLITE_PATH ?? DEFAULT_SQLITE_PATH,
  };
};

const normalizeClient = (rawClient: string | undefined): DatabaseClient => {
  if (!rawClient) {
    return "sqlite";
  }

  if (rawClient === "sqlite" || rawClient === "postgres") {
    return rawClient;
  }

  throw new Error("DB_CLIENT must be either 'sqlite' or 'postgres'");
};

export type { DatabaseConfig, DatabaseClient };
