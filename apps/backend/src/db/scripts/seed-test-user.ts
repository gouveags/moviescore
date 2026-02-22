import { getAuthDatabase } from "../../platform/auth/auth-db";
import {
  seedLocalTestUser,
  LOCAL_TEST_EMAIL,
  LOCAL_TEST_PASSWORD,
} from "../../platform/auth/seed-local-test-user";

const run = async (): Promise<void> => {
  const database = await getAuthDatabase();
  await seedLocalTestUser(database);
  console.log(`Local test user ensured: ${LOCAL_TEST_EMAIL} / ${LOCAL_TEST_PASSWORD}`);
};

run().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
