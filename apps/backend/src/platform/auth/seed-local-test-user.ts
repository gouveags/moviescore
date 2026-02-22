import { findAuthUserByEmail, createUserWithAuth } from "@backend/platform/auth/auth-repository";
import { hashPassword, createId } from "@backend/platform/security/crypto";
import type { Database } from "@backend/db/client";

const LOCAL_TEST_EMAIL = "test.user@moviescore.local";
const LOCAL_TEST_PASSWORD = "MoviescoreTest#123";
const LOCAL_TEST_NAME = "Test Pilot";

const seedLocalTestUser = async (database: Database): Promise<void> => {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  const nodeEnv = env?.NODE_ENV ?? "development";
  const isLocalAllowed = nodeEnv !== "production";

  if (!isLocalAllowed) {
    return;
  }

  const existing = await findAuthUserByEmail(database, LOCAL_TEST_EMAIL);
  if (existing) {
    return;
  }

  const passwordHash = await hashPassword(LOCAL_TEST_PASSWORD);
  await createUserWithAuth(database, {
    userId: createId(),
    email: LOCAL_TEST_EMAIL,
    displayName: LOCAL_TEST_NAME,
    passwordHash,
  });
};

export { LOCAL_TEST_EMAIL, LOCAL_TEST_NAME, LOCAL_TEST_PASSWORD, seedLocalTestUser };
