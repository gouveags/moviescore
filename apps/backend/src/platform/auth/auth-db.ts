import { createDatabase } from "@backend/db/client";
import { resolveDatabaseConfig } from "@backend/db/config";
import { migrateDatabase } from "@backend/db/migrate";
import type { Database } from "@backend/db/client";
import { seedLocalTestUser } from "@backend/platform/auth/seed-local-test-user";

const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env ?? {
  NODE_ENV: "development",
};

let databaseInstance: Database | null = null;
let migrationPromise: Promise<void> | null = null;

const getAuthDatabase = async (): Promise<Database> => {
  if (!databaseInstance) {
    const configured = resolveDatabaseConfig({
      ...runtimeEnv,
      SQLITE_PATH:
        runtimeEnv.NODE_ENV === "test"
          ? ":memory:"
          : (runtimeEnv.SQLITE_PATH ?? "/tmp/moviescore.db"),
    });
    databaseInstance = await createDatabase(configured);
  }

  if (!migrationPromise) {
    migrationPromise = (async () => {
      await migrateDatabase(databaseInstance!);
      await seedLocalTestUser(databaseInstance!);
    })();
  }

  await migrationPromise;
  return databaseInstance;
};

export { getAuthDatabase, runtimeEnv };
