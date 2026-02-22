import { closeDatabase, createDatabase } from "../client";
import { resolveDatabaseConfig } from "../config";

const run = async (): Promise<void> => {
  const config = resolveDatabaseConfig(process.env);
  const database = await createDatabase(config);

  try {
    const rows = await database.query<{ ok: number }>("SELECT 1 AS ok");
    const okValue = rows[0]?.ok ?? 0;

    if (Number(okValue) !== 1) {
      throw new Error("Unexpected database check response");
    }

    console.log(`Database check passed (${config.client}).`);
  } finally {
    await closeDatabase(database);
  }
};

run().catch((error: unknown) => {
  console.error("Database check failed:", error);
  process.exit(1);
});
