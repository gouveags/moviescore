import { closeDatabase, createDatabase } from "../client";
import { resolveDatabaseConfig } from "../config";
import { migrateDatabase } from "../migrate";

const run = async (): Promise<void> => {
  const config = resolveDatabaseConfig(process.env);
  const database = await createDatabase(config);

  try {
    await migrateDatabase(database);
    console.log(`Database migration complete (${config.client}).`);
  } finally {
    await closeDatabase(database);
  }
};

run().catch((error: unknown) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
