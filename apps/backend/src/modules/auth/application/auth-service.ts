import {
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
  type AuthUserRecord,
} from "@backend/platform/auth/auth-repository";
import {
  createId,
  decryptAtRest,
  deriveTokenPepper,
  encryptAtRest,
  generateOpaqueToken,
  hashOpaqueToken,
  hashPassword,
  verifyPassword,
  type RuntimeEnv,
} from "@backend/platform/security/crypto";
import { buildTotpUri, generateTotpSecret, verifyTotpCode } from "@backend/platform/security/totp";
import type { Database } from "@backend/db/client";
import { validatePasswordStrength } from "@backend/modules/auth/domain/password-policy";
import type {
  AuthenticatedUser,
  AuthLoginInput,
  AuthLoginResult,
  AuthRegisterInput,
  AuthSecurityConfig,
  AuthSessionTokens,
  DisableTwoFactorInput,
  EnableTwoFactorInput,
  PasswordResetRequestResult,
  ResetPasswordInput,
} from "@backend/modules/auth/domain/auth-types";

class AuthServiceError extends Error {
  public readonly statusCode: 400 | 401 | 404 | 409 | 423 | 500;

  public constructor(message: string, statusCode: 400 | 401 | 404 | 409 | 423 | 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

type AuthServiceDependencies = {
  database: Database;
  env: RuntimeEnv;
  security: AuthSecurityConfig;
};

class AuthService {
  private readonly database: Database;
  private readonly env: RuntimeEnv;
  private readonly security: AuthSecurityConfig;

  public constructor(dependencies: AuthServiceDependencies) {
    this.database = dependencies.database;
    this.env = dependencies.env;
    this.security = dependencies.security;
  }

  public async register(input: AuthRegisterInput): Promise<AuthLoginResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    if (!normalizedEmail || !input.displayName.trim()) {
      throw new AuthServiceError("Email and display name are required.", 400);
    }

    const passwordIssues = validatePasswordStrength(input.password);
    if (passwordIssues.length > 0) {
      throw new AuthServiceError(passwordIssues[0], 400);
    }

    const existingUser = await findAuthUserByEmail(this.database, normalizedEmail);
    if (existingUser) {
      throw new AuthServiceError("Account already exists.", 409);
    }

    const userId = createId();
    const passwordHash = await hashPassword(input.password);
    await createUserWithAuth(this.database, {
      userId,
      email: normalizedEmail,
      displayName: input.displayName.trim(),
      passwordHash,
    });

    return this.createSessionForUser(userId);
  }

  public async login(input: AuthLoginInput): Promise<AuthLoginResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await findAuthUserByEmail(this.database, normalizedEmail);
    if (!user) {
      throw new AuthServiceError("Invalid credentials.", 401);
    }

    this.assertNotLocked(user);
    const isValidPassword = await verifyPassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      await this.recordFailedAttempt(user);
      throw new AuthServiceError("Invalid credentials.", 401);
    }

    if (user.mfaEnabled) {
      const hasTotpCode = Boolean(input.totpCode?.trim());
      const hasRecoveryCode = Boolean(input.recoveryCode?.trim());
      if (!hasTotpCode && !hasRecoveryCode) {
        throw new AuthServiceError("Two-factor code is required.", 401);
      }

      if (hasTotpCode) {
        await this.verifyTotpForUser(user, input.totpCode!.trim());
      } else {
        const tokenPepper = deriveTokenPepper(this.env);
        const recoveryHash = await hashOpaqueToken(input.recoveryCode!.trim(), tokenPepper);
        const consumed = await consumeRecoveryCode(this.database, {
          userId: user.userId,
          codeHash: recoveryHash,
        });
        if (!consumed) {
          throw new AuthServiceError("Invalid recovery code.", 401);
        }
      }
    }

    await updateAuthLockState(this.database, {
      userId: user.userId,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    return this.createSessionForUser(user.userId);
  }

  public async refresh(refreshToken: string): Promise<AuthLoginResult> {
    const tokenPepper = deriveTokenPepper(this.env);
    const refreshTokenHash = await hashOpaqueToken(refreshToken, tokenPepper);
    const session = await findSessionByRefreshTokenHash(this.database, refreshTokenHash);
    if (!session || session.revokedAt) {
      throw new AuthServiceError("Invalid session.", 401);
    }

    if (new Date(session.refreshExpiresAt).getTime() <= Date.now()) {
      await revokeSessionById(this.database, session.id);
      throw new AuthServiceError("Session expired.", 401);
    }

    const nextTokens = await this.generateSessionTokens();
    const nextHashes = {
      accessTokenHash: await hashOpaqueToken(nextTokens.accessToken, tokenPepper),
      refreshTokenHash: await hashOpaqueToken(nextTokens.refreshToken, tokenPepper),
    };

    await rotateSessionTokens(this.database, {
      sessionId: session.id,
      accessTokenHash: nextHashes.accessTokenHash,
      refreshTokenHash: nextHashes.refreshTokenHash,
      accessExpiresAt: nextTokens.accessExpiresAt,
      refreshExpiresAt: nextTokens.refreshExpiresAt,
    });

    const user = await findAuthUserById(this.database, session.userId);
    if (!user) {
      throw new AuthServiceError("Invalid session.", 401);
    }

    return {
      user: this.toAuthenticatedUser(user),
      tokens: nextTokens,
    };
  }

  public async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }
    const tokenPepper = deriveTokenPepper(this.env);
    const refreshTokenHash = await hashOpaqueToken(refreshToken, tokenPepper);
    const session = await findSessionByRefreshTokenHash(this.database, refreshTokenHash);
    if (session) {
      await revokeSessionById(this.database, session.id);
    }
  }

  public async authenticateAccessToken(accessToken: string): Promise<AuthenticatedUser> {
    const tokenPepper = deriveTokenPepper(this.env);
    const accessTokenHash = await hashOpaqueToken(accessToken, tokenPepper);
    const session = await findSessionByAccessTokenHash(this.database, accessTokenHash);
    if (!session || session.revokedAt) {
      throw new AuthServiceError("Not authenticated.", 401);
    }
    if (new Date(session.accessExpiresAt).getTime() <= Date.now()) {
      throw new AuthServiceError("Session expired.", 401);
    }

    const user = await findAuthUserById(this.database, session.userId);
    if (!user) {
      throw new AuthServiceError("Not authenticated.", 401);
    }
    return this.toAuthenticatedUser(user);
  }

  public async requestPasswordReset(email: string): Promise<PasswordResetRequestResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await findAuthUserByEmail(this.database, normalizedEmail);
    if (!user) {
      return {};
    }

    const resetToken = generateOpaqueToken();
    const tokenPepper = deriveTokenPepper(this.env);
    const tokenHash = await hashOpaqueToken(resetToken, tokenPepper);
    const expiresAt = new Date(
      Date.now() + this.security.resetTokenTtlSeconds * 1000,
    ).toISOString();

    await createPasswordResetToken(this.database, {
      id: createId(),
      userId: user.userId,
      tokenHash,
      expiresAt,
    });

    if (this.env.NODE_ENV === "production") {
      return {};
    }
    return { resetToken };
  }

  public async confirmPasswordReset(input: ResetPasswordInput): Promise<void> {
    const issues = validatePasswordStrength(input.newPassword);
    if (issues.length > 0) {
      throw new AuthServiceError(issues[0], 400);
    }

    const tokenPepper = deriveTokenPepper(this.env);
    const tokenHash = await hashOpaqueToken(input.resetToken, tokenPepper);
    const resetRecord = await findPasswordResetToken(this.database, tokenHash);
    if (!resetRecord || resetRecord.usedAt) {
      throw new AuthServiceError("Invalid recovery token.", 400);
    }
    if (new Date(resetRecord.expiresAt).getTime() <= Date.now()) {
      throw new AuthServiceError("Recovery token expired.", 400);
    }

    const nextPasswordHash = await hashPassword(input.newPassword);
    await updatePasswordHash(this.database, {
      userId: resetRecord.userId,
      passwordHash: nextPasswordHash,
    });
    await markPasswordResetTokenUsed(this.database, resetRecord.id);
    await revokeAllSessionsForUser(this.database, resetRecord.userId);
  }

  public async setupTwoFactor(
    userId: string,
  ): Promise<{ setupSecret: string; otpauthUrl: string }> {
    const user = await findAuthUserById(this.database, userId);
    if (!user) {
      throw new AuthServiceError("User not found.", 404);
    }

    const setupSecret = generateTotpSecret();
    const encryptedSecret = await encryptAtRest(setupSecret, this.env);
    await upsertMfaSecret(this.database, {
      userId: user.userId,
      encryptedSecret,
      enabled: false,
    });

    return {
      setupSecret,
      otpauthUrl: buildTotpUri(user.email, setupSecret),
    };
  }

  public async enableTwoFactor(input: EnableTwoFactorInput): Promise<{ recoveryCodes: string[] }> {
    const user = await findAuthUserById(this.database, input.userId);
    if (!user || !user.mfaSecretEncrypted) {
      throw new AuthServiceError("Two-factor setup not found.", 400);
    }

    const decryptedSecret = await decryptAtRest(user.mfaSecretEncrypted, this.env);
    if (!verifyTotpCode(input.totpCode, decryptedSecret)) {
      throw new AuthServiceError("Invalid two-factor code.", 400);
    }

    await upsertMfaSecret(this.database, {
      userId: user.userId,
      encryptedSecret: user.mfaSecretEncrypted,
      enabled: true,
    });

    const rawCodes = Array.from({ length: 8 }, () => generateOpaqueToken().slice(0, 12));
    const tokenPepper = deriveTokenPepper(this.env);
    const hashedCodes = await Promise.all(
      rawCodes.map(async (code) => ({
        id: createId(),
        codeHash: await hashOpaqueToken(code, tokenPepper),
      })),
    );
    await replaceRecoveryCodes(this.database, {
      userId: user.userId,
      recoveryCodes: hashedCodes,
    });

    return { recoveryCodes: rawCodes };
  }

  public async disableTwoFactor(input: DisableTwoFactorInput): Promise<void> {
    const user = await findAuthUserById(this.database, input.userId);
    if (!user || !user.mfaEnabled || !user.mfaSecretEncrypted) {
      throw new AuthServiceError("Two-factor is not enabled.", 400);
    }

    const decryptedSecret = await decryptAtRest(user.mfaSecretEncrypted, this.env);
    if (!verifyTotpCode(input.totpCode, decryptedSecret)) {
      throw new AuthServiceError("Invalid two-factor code.", 400);
    }

    await disableMfa(this.database, input.userId);
    await replaceRecoveryCodes(this.database, {
      userId: input.userId,
      recoveryCodes: [],
    });
  }

  private async createSessionForUser(userId: string): Promise<AuthLoginResult> {
    const user = await findAuthUserById(this.database, userId);
    if (!user) {
      throw new AuthServiceError("User not found.", 404);
    }

    const tokenPepper = deriveTokenPepper(this.env);
    const tokens = await this.generateSessionTokens();
    await createSession(this.database, {
      id: createId(),
      userId,
      accessTokenHash: await hashOpaqueToken(tokens.accessToken, tokenPepper),
      refreshTokenHash: await hashOpaqueToken(tokens.refreshToken, tokenPepper),
      accessExpiresAt: tokens.accessExpiresAt,
      refreshExpiresAt: tokens.refreshExpiresAt,
      revokedAt: null,
    });

    return {
      user: this.toAuthenticatedUser(user),
      tokens,
    };
  }

  private toAuthenticatedUser(record: AuthUserRecord): AuthenticatedUser {
    return {
      userId: record.userId,
      email: record.email,
      displayName: record.displayName,
      mfaEnabled: record.mfaEnabled,
    };
  }

  private assertNotLocked(user: AuthUserRecord): void {
    if (!user.lockedUntil) {
      return;
    }
    if (new Date(user.lockedUntil).getTime() > Date.now()) {
      throw new AuthServiceError("Account temporarily locked. Please try later.", 423);
    }
  }

  private async recordFailedAttempt(user: AuthUserRecord): Promise<void> {
    const nextAttempts = user.failedLoginAttempts + 1;
    if (nextAttempts >= this.security.maxFailedAttempts) {
      await updateAuthLockState(this.database, {
        userId: user.userId,
        failedLoginAttempts: 0,
        lockedUntil: new Date(Date.now() + this.security.lockoutSeconds * 1000).toISOString(),
      });
      return;
    }

    await updateAuthLockState(this.database, {
      userId: user.userId,
      failedLoginAttempts: nextAttempts,
      lockedUntil: null,
    });
  }

  private async verifyTotpForUser(user: AuthUserRecord, totpCode: string): Promise<void> {
    if (!user.mfaSecretEncrypted) {
      throw new AuthServiceError("Two-factor is misconfigured. Contact support.", 500);
    }
    const decryptedSecret = await decryptAtRest(user.mfaSecretEncrypted, this.env);
    if (!verifyTotpCode(totpCode, decryptedSecret)) {
      throw new AuthServiceError("Invalid two-factor code.", 401);
    }
  }

  private async generateSessionTokens(): Promise<AuthSessionTokens> {
    const accessToken = generateOpaqueToken();
    const refreshToken = generateOpaqueToken();
    return {
      accessToken,
      refreshToken,
      accessExpiresAt: new Date(
        Date.now() + this.security.accessTokenTtlSeconds * 1000,
      ).toISOString(),
      refreshExpiresAt: new Date(
        Date.now() + this.security.refreshTokenTtlSeconds * 1000,
      ).toISOString(),
    };
  }
}

const defaultAuthSecurityConfig: AuthSecurityConfig = {
  accessTokenTtlSeconds: 60 * 5,
  refreshTokenTtlSeconds: 60 * 60 * 24 * 7,
  resetTokenTtlSeconds: 60 * 15,
  maxFailedAttempts: 5,
  lockoutSeconds: 60 * 15,
};

export { AuthService, AuthServiceError, defaultAuthSecurityConfig };
