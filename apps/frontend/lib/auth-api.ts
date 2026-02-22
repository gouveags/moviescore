const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8787";

type AuthUser = {
  userId: string;
  email: string;
  displayName: string;
  mfaEnabled: boolean;
};

const requestJson = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; data: T }> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = (await response.json()) as T;
  return { status: response.status, data: body };
};

const register = (input: { email: string; displayName: string; password: string }) =>
  requestJson<{ user?: AuthUser; error?: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

const login = (input: {
  email: string;
  password: string;
  totpCode?: string;
  recoveryCode?: string;
}) =>
  requestJson<{ user?: AuthUser; error?: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

const getMe = () => requestJson<{ user?: AuthUser; error?: string }>("/api/auth/me");

const refreshSession = () =>
  requestJson<{ user?: AuthUser; error?: string }>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({}),
  });

const logout = () =>
  requestJson<{ ok?: boolean; error?: string }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });

const requestRecovery = (email: string) =>
  requestJson<{ ok?: boolean; resetToken?: string; error?: string }>("/api/auth/recovery/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

const confirmRecovery = (input: { resetToken: string; newPassword: string }) =>
  requestJson<{ ok?: boolean; error?: string }>("/api/auth/recovery/confirm", {
    method: "POST",
    body: JSON.stringify(input),
  });

export { confirmRecovery, getMe, login, logout, refreshSession, register, requestRecovery };
export type { AuthUser };
