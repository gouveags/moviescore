import type { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { AppEnv } from "@backend/platform/http/app-env";
import { getAuthDatabase, runtimeEnv } from "@backend/platform/auth/auth-db";
import {
  AuthService,
  AuthServiceError,
  defaultAuthSecurityConfig,
} from "@backend/modules/auth/application/auth-service";

const ACCESS_COOKIE = "moviescore_access";
const REFRESH_COOKIE = "moviescore_refresh";

const registerAuthRoutes = (app: Hono<AppEnv>): void => {
  const authServicePromise = createAuthService();
  const frontendOrigin = runtimeEnv.FRONTEND_ORIGIN ?? "http://localhost:3000";
  const secureCookies = runtimeEnv.NODE_ENV === "production";

  app.use(
    "/api/*",
    cors({
      origin: frontendOrigin,
      credentials: true,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    }),
  );

  app.post("/api/auth/register", async (c) => {
    try {
      const body = await c.req.json<{ email: string; displayName: string; password: string }>();
      const authService = await authServicePromise;
      const result = await authService.register(body);
      setAuthCookies(c, result.tokens.accessToken, result.tokens.refreshToken, secureCookies);
      return c.json({ user: result.user }, 201);
    } catch (error) {
      return handleAuthError(c, error);
    }
  });

  app.post("/api/auth/login", async (c) => {
    try {
      const body = await c.req.json<{
        email: string;
        password: string;
        totpCode?: string;
        recoveryCode?: string;
      }>();
      const authService = await authServicePromise;
      const result = await authService.login(body);
      setAuthCookies(c, result.tokens.accessToken, result.tokens.refreshToken, secureCookies);
      return c.json({ user: result.user });
    } catch (error) {
      return handleAuthError(c, error);
    }
  });

  app.post("/api/auth/refresh", async (c) => {
    try {
      const refreshToken = getCookie(c, REFRESH_COOKIE);
      if (!refreshToken) {
        return c.json({ error: "Missing refresh token." }, 401);
      }
      const authService = await authServicePromise;
      const result = await authService.refresh(refreshToken);
      setAuthCookies(c, result.tokens.accessToken, result.tokens.refreshToken, secureCookies);
      return c.json({ user: result.user });
    } catch (error) {
      clearAuthCookies(c);
      return handleAuthError(c, error);
    }
  });

  app.post("/api/auth/logout", async (c) => {
    try {
      const refreshToken = getCookie(c, REFRESH_COOKIE);
      const authService = await authServicePromise;
      await authService.logout(refreshToken);
      clearAuthCookies(c);
      return c.json({ ok: true });
    } catch (error) {
      clearAuthCookies(c);
      return handleAuthError(c, error);
    }
  });

  app.get("/api/auth/me", async (c) => {
    try {
      const accessToken = getCookie(c, ACCESS_COOKIE);
      if (!accessToken) {
        return c.json({ error: "Not authenticated." }, 401);
      }

      const authService = await authServicePromise;
      const user = await authService.authenticateAccessToken(accessToken);
      return c.json({ user });
    } catch (error) {
      return handleAuthError(c, error);
    }
  });

  app.post("/api/auth/recovery/request", async (c) => {
    try {
      const { email } = await c.req.json<{ email: string }>();
      const authService = await authServicePromise;
      const result = await authService.requestPasswordReset(email);
      return c.json({
        ok: true,
        ...(result.resetToken ? { resetToken: result.resetToken } : {}),
      });
    } catch (error) {
      return handleAuthError(c, error);
    }
  });

  app.post("/api/auth/recovery/confirm", async (c) => {
    try {
      const body = await c.req.json<{ resetToken: string; newPassword: string }>();
      const authService = await authServicePromise;
      await authService.confirmPasswordReset(body);
      return c.json({ ok: true });
    } catch (error) {
      return handleAuthError(c, error);
    }
  });

  app.post("/api/auth/2fa/setup", async (c) => {
    try {
      const accessToken = getCookie(c, ACCESS_COOKIE);
      if (!accessToken) {
        return c.json({ error: "Not authenticated." }, 401);
      }
      const authService = await authServicePromise;
      const user = await authService.authenticateAccessToken(accessToken);
      const payload = await authService.setupTwoFactor(user.userId);
      return c.json(payload);
    } catch (error) {
      return handleAuthError(c, error);
    }
  });

  app.post("/api/auth/2fa/enable", async (c) => {
    try {
      const accessToken = getCookie(c, ACCESS_COOKIE);
      if (!accessToken) {
        return c.json({ error: "Not authenticated." }, 401);
      }
      const authService = await authServicePromise;
      const user = await authService.authenticateAccessToken(accessToken);
      const { totpCode } = await c.req.json<{ totpCode: string }>();
      const payload = await authService.enableTwoFactor({ userId: user.userId, totpCode });
      return c.json(payload);
    } catch (error) {
      return handleAuthError(c, error);
    }
  });

  app.post("/api/auth/2fa/disable", async (c) => {
    try {
      const accessToken = getCookie(c, ACCESS_COOKIE);
      if (!accessToken) {
        return c.json({ error: "Not authenticated." }, 401);
      }
      const authService = await authServicePromise;
      const user = await authService.authenticateAccessToken(accessToken);
      const { totpCode } = await c.req.json<{ totpCode: string }>();
      await authService.disableTwoFactor({ userId: user.userId, totpCode });
      return c.json({ ok: true });
    } catch (error) {
      return handleAuthError(c, error);
    }
  });
};

const createAuthService = async (): Promise<AuthService> => {
  const database = await getAuthDatabase();
  return new AuthService({
    database,
    env: runtimeEnv,
    security: defaultAuthSecurityConfig,
  });
};

const setAuthCookies = (
  context: Parameters<typeof setCookie>[0],
  accessToken: string,
  refreshToken: string,
  secure: boolean,
): void => {
  setCookie(context, ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "Strict",
    secure,
    path: "/",
    maxAge: defaultAuthSecurityConfig.accessTokenTtlSeconds,
  });

  setCookie(context, REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "Strict",
    secure,
    path: "/api/auth",
    maxAge: defaultAuthSecurityConfig.refreshTokenTtlSeconds,
  });
};

const clearAuthCookies = (context: Parameters<typeof setCookie>[0]): void => {
  deleteCookie(context, ACCESS_COOKIE, { path: "/" });
  deleteCookie(context, REFRESH_COOKIE, { path: "/api/auth" });
};

const handleAuthError = (context: Parameters<typeof setCookie>[0], error: unknown): Response => {
  if (error instanceof AuthServiceError) {
    return context.json({ error: error.message }, error.statusCode);
  }
  console.error("auth.error", error);
  return context.json({ error: "Unexpected auth error." }, 500);
};

export { registerAuthRoutes };
