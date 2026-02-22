type AuthenticatedUser = {
  userId: string;
  email: string;
  displayName: string;
  mfaEnabled: boolean;
};

type AuthSessionTokens = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
};

type AuthLoginResult = {
  user: AuthenticatedUser;
  tokens: AuthSessionTokens;
};

type PasswordResetRequestResult = {
  resetToken?: string;
};

type AuthRegisterInput = {
  email: string;
  displayName: string;
  password: string;
};

type AuthLoginInput = {
  email: string;
  password: string;
  totpCode?: string;
  recoveryCode?: string;
};

type ResetPasswordInput = {
  resetToken: string;
  newPassword: string;
};

type EnableTwoFactorInput = {
  userId: string;
  totpCode: string;
};

type DisableTwoFactorInput = {
  userId: string;
  totpCode: string;
};

type AuthSecurityConfig = {
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
  resetTokenTtlSeconds: number;
  maxFailedAttempts: number;
  lockoutSeconds: number;
};

export type {
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
};
