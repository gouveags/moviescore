import type { Database } from "@backend/db/client";

type AuthUserRecord = {
  userId: string;
  email: string;
  displayName: string;
  passwordHash: string;
  mfaEnabled: boolean;
  mfaSecretEncrypted: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
};

type SessionRecord = {
  id: string;
  userId: string;
  accessTokenHash: string;
  refreshTokenHash: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  revokedAt: string | null;
};

type RecoveryCodeRecord = {
  id: string;
  codeHash: string;
  usedAt: string | null;
};

type PasswordResetRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
};

const findAuthUserByEmail = async (
  database: Database,
  email: string,
): Promise<AuthUserRecord | null> => {
  const rows = await database.query<{
    user_id: string;
    email: string;
    display_name: string;
    password_hash: string;
    mfa_enabled: number;
    mfa_secret_encrypted: string | null;
    failed_login_attempts: number;
    locked_until: string | null;
  }>(
    `
      SELECT
        u.id as user_id,
        u.email as email,
        u.display_name as display_name,
        a.password_hash as password_hash,
        a.mfa_enabled as mfa_enabled,
        a.mfa_secret_encrypted as mfa_secret_encrypted,
        a.failed_login_attempts as failed_login_attempts,
        a.locked_until as locked_until
      FROM users u
      INNER JOIN auth_users a ON a.user_id = u.id
      WHERE u.email = ?
      LIMIT 1
    `,
    [email.toLowerCase()],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    mfaEnabled: row.mfa_enabled === 1,
    mfaSecretEncrypted: row.mfa_secret_encrypted,
    failedLoginAttempts: Number(row.failed_login_attempts),
    lockedUntil: row.locked_until,
  };
};

const findAuthUserById = async (
  database: Database,
  userId: string,
): Promise<AuthUserRecord | null> => {
  const rows = await database.query<{
    user_id: string;
    email: string;
    display_name: string;
    password_hash: string;
    mfa_enabled: number;
    mfa_secret_encrypted: string | null;
    failed_login_attempts: number;
    locked_until: string | null;
  }>(
    `
      SELECT
        u.id as user_id,
        u.email as email,
        u.display_name as display_name,
        a.password_hash as password_hash,
        a.mfa_enabled as mfa_enabled,
        a.mfa_secret_encrypted as mfa_secret_encrypted,
        a.failed_login_attempts as failed_login_attempts,
        a.locked_until as locked_until
      FROM users u
      INNER JOIN auth_users a ON a.user_id = u.id
      WHERE u.id = ?
      LIMIT 1
    `,
    [userId],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    mfaEnabled: row.mfa_enabled === 1,
    mfaSecretEncrypted: row.mfa_secret_encrypted,
    failedLoginAttempts: Number(row.failed_login_attempts),
    lockedUntil: row.locked_until,
  };
};

const createUserWithAuth = async (
  database: Database,
  input: { userId: string; email: string; displayName: string; passwordHash: string },
): Promise<void> => {
  await database.run("INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)", [
    input.userId,
    input.email.toLowerCase(),
    input.displayName,
  ]);

  await database.run(
    "INSERT INTO auth_users (user_id, password_hash, mfa_enabled, failed_login_attempts) VALUES (?, ?, 0, 0)",
    [input.userId, input.passwordHash],
  );
};

const updateAuthLockState = async (
  database: Database,
  input: { userId: string; failedLoginAttempts: number; lockedUntil: string | null },
): Promise<void> => {
  await database.run(
    `
      UPDATE auth_users
      SET failed_login_attempts = ?, locked_until = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
    [input.failedLoginAttempts, input.lockedUntil, input.userId],
  );
};

const updatePasswordHash = async (
  database: Database,
  input: { userId: string; passwordHash: string },
): Promise<void> => {
  await database.run(
    `
      UPDATE auth_users
      SET password_hash = ?, failed_login_attempts = 0, locked_until = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
    [input.passwordHash, input.userId],
  );
};

const upsertMfaSecret = async (
  database: Database,
  input: { userId: string; encryptedSecret: string; enabled: boolean },
): Promise<void> => {
  await database.run(
    `
      UPDATE auth_users
      SET mfa_secret_encrypted = ?, mfa_enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
    [input.encryptedSecret, input.enabled ? 1 : 0, input.userId],
  );
};

const disableMfa = async (database: Database, userId: string): Promise<void> => {
  await database.run(
    `
      UPDATE auth_users
      SET mfa_enabled = 0, mfa_secret_encrypted = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `,
    [userId],
  );
};

const replaceRecoveryCodes = async (
  database: Database,
  input: { userId: string; recoveryCodes: Array<{ id: string; codeHash: string }> },
): Promise<void> => {
  await database.run("DELETE FROM auth_recovery_codes WHERE user_id = ?", [input.userId]);
  for (const recoveryCode of input.recoveryCodes) {
    await database.run(
      "INSERT INTO auth_recovery_codes (id, user_id, code_hash) VALUES (?, ?, ?)",
      [recoveryCode.id, input.userId, recoveryCode.codeHash],
    );
  }
};

const consumeRecoveryCode = async (
  database: Database,
  input: { userId: string; codeHash: string },
): Promise<boolean> => {
  const rows = await database.query<RecoveryCodeRecord>(
    `
      SELECT id as id, code_hash as codeHash, used_at as usedAt
      FROM auth_recovery_codes
      WHERE user_id = ? AND code_hash = ? AND used_at IS NULL
      LIMIT 1
    `,
    [input.userId, input.codeHash],
  );
  const record = rows[0];
  if (!record) {
    return false;
  }

  await database.run("UPDATE auth_recovery_codes SET used_at = CURRENT_TIMESTAMP WHERE id = ?", [
    record.id,
  ]);
  return true;
};

const createSession = async (database: Database, session: SessionRecord): Promise<void> => {
  await database.run(
    `
      INSERT INTO auth_sessions (
        id, user_id, access_token_hash, refresh_token_hash, access_expires_at, refresh_expires_at, revoked_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL)
    `,
    [
      session.id,
      session.userId,
      session.accessTokenHash,
      session.refreshTokenHash,
      session.accessExpiresAt,
      session.refreshExpiresAt,
    ],
  );
};

const findSessionByAccessTokenHash = async (
  database: Database,
  accessTokenHash: string,
): Promise<SessionRecord | null> => {
  const rows = await database.query<SessionRecord>(
    `
      SELECT
        id as id,
        user_id as userId,
        access_token_hash as accessTokenHash,
        refresh_token_hash as refreshTokenHash,
        access_expires_at as accessExpiresAt,
        refresh_expires_at as refreshExpiresAt,
        revoked_at as revokedAt
      FROM auth_sessions
      WHERE access_token_hash = ?
      LIMIT 1
    `,
    [accessTokenHash],
  );
  return rows[0] ?? null;
};

const findSessionByRefreshTokenHash = async (
  database: Database,
  refreshTokenHash: string,
): Promise<SessionRecord | null> => {
  const rows = await database.query<SessionRecord>(
    `
      SELECT
        id as id,
        user_id as userId,
        access_token_hash as accessTokenHash,
        refresh_token_hash as refreshTokenHash,
        access_expires_at as accessExpiresAt,
        refresh_expires_at as refreshExpiresAt,
        revoked_at as revokedAt
      FROM auth_sessions
      WHERE refresh_token_hash = ?
      LIMIT 1
    `,
    [refreshTokenHash],
  );
  return rows[0] ?? null;
};

const revokeSessionById = async (database: Database, sessionId: string): Promise<void> => {
  await database.run("UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?", [
    sessionId,
  ]);
};

const revokeAllSessionsForUser = async (database: Database, userId: string): Promise<void> => {
  await database.run(
    "UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL",
    [userId],
  );
};

const rotateSessionTokens = async (
  database: Database,
  input: {
    sessionId: string;
    accessTokenHash: string;
    refreshTokenHash: string;
    accessExpiresAt: string;
    refreshExpiresAt: string;
  },
): Promise<void> => {
  await database.run(
    `
      UPDATE auth_sessions
      SET access_token_hash = ?, refresh_token_hash = ?, access_expires_at = ?, refresh_expires_at = ?
      WHERE id = ?
    `,
    [
      input.accessTokenHash,
      input.refreshTokenHash,
      input.accessExpiresAt,
      input.refreshExpiresAt,
      input.sessionId,
    ],
  );
};

const createPasswordResetToken = async (
  database: Database,
  input: { id: string; userId: string; tokenHash: string; expiresAt: string },
): Promise<void> => {
  await database.run(
    `
      INSERT INTO auth_password_reset_tokens (id, user_id, token_hash, expires_at, used_at)
      VALUES (?, ?, ?, ?, NULL)
    `,
    [input.id, input.userId, input.tokenHash, input.expiresAt],
  );
};

const findPasswordResetToken = async (
  database: Database,
  tokenHash: string,
): Promise<PasswordResetRecord | null> => {
  const rows = await database.query<PasswordResetRecord>(
    `
      SELECT
        id as id,
        user_id as userId,
        token_hash as tokenHash,
        expires_at as expiresAt,
        used_at as usedAt
      FROM auth_password_reset_tokens
      WHERE token_hash = ?
      LIMIT 1
    `,
    [tokenHash],
  );
  return rows[0] ?? null;
};

const markPasswordResetTokenUsed = async (database: Database, id: string): Promise<void> => {
  await database.run(
    "UPDATE auth_password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id],
  );
};

export {
  consumeRecoveryCode,
  createPasswordResetToken,
  createSession,
  createUserWithAuth,
  disableMfa,
  findAuthUserByEmail,
  findAuthUserById,
  findPasswordResetToken,
  findSessionByAccessTokenHash,
  findSessionByRefreshTokenHash,
  markPasswordResetTokenUsed,
  replaceRecoveryCodes,
  revokeAllSessionsForUser,
  revokeSessionById,
  rotateSessionTokens,
  updateAuthLockState,
  updatePasswordHash,
  upsertMfaSecret,
};
export type { AuthUserRecord, PasswordResetRecord, SessionRecord };
