import app from "../src/index";
import { authenticator } from "otplib";

const parseCookieHeader = (headers: Headers): string => {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) {
    return "";
  }
  return setCookie
    .split(", ")
    .map((segment) => segment.split(";")[0])
    .join("; ");
};

describe("auth flow", () => {
  it("registers, logs in, returns profile, then logs out", async () => {
    const registerResponse = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "alice@example.com",
        displayName: "Alice",
        password: "MoviescoreSecure#123",
      }),
    });
    expect(registerResponse.status).toBe(201);
    const cookieHeader = parseCookieHeader(registerResponse.headers);
    expect(cookieHeader).toContain("moviescore_access=");
    expect(cookieHeader).toContain("moviescore_refresh=");

    const meResponse = await app.request("/api/auth/me", {
      headers: { cookie: cookieHeader },
    });
    expect(meResponse.status).toBe(200);
    const mePayload = (await meResponse.json()) as { user: { displayName: string } };
    expect(mePayload.user.displayName).toBe("Alice");

    const logoutResponse = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { cookie: cookieHeader },
    });
    expect(logoutResponse.status).toBe(200);
  });

  it("enforces two-factor when enabled", async () => {
    const registerResponse = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "mfa@example.com",
        displayName: "MFA User",
        password: "MoviescoreSecure#123",
      }),
    });
    const cookieHeader = parseCookieHeader(registerResponse.headers);

    const setupResponse = await app.request("/api/auth/2fa/setup", {
      method: "POST",
      headers: {
        cookie: cookieHeader,
      },
    });
    expect(setupResponse.status).toBe(200);
    const setupPayload = (await setupResponse.json()) as { setupSecret: string };
    const totpCode = authenticator.generate(setupPayload.setupSecret);

    const enableResponse = await app.request("/api/auth/2fa/enable", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: cookieHeader,
      },
      body: JSON.stringify({ totpCode }),
    });
    expect(enableResponse.status).toBe(200);

    const plainLogin = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "mfa@example.com",
        password: "MoviescoreSecure#123",
      }),
    });
    expect(plainLogin.status).toBe(401);

    const guardedLogin = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "mfa@example.com",
        password: "MoviescoreSecure#123",
        totpCode: authenticator.generate(setupPayload.setupSecret),
      }),
    });
    expect(guardedLogin.status).toBe(200);
  });

  it("supports password reset recovery flow", async () => {
    await app.request("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "recover@example.com",
        displayName: "Recovery User",
        password: "MoviescoreSecure#123",
      }),
    });

    const requestResponse = await app.request("/api/auth/recovery/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "recover@example.com" }),
    });
    expect(requestResponse.status).toBe(200);
    const requestPayload = (await requestResponse.json()) as { resetToken?: string };
    expect(requestPayload.resetToken).toBeTruthy();

    const confirmResponse = await app.request("/api/auth/recovery/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        resetToken: requestPayload.resetToken,
        newPassword: "MoviescoreSecure#456",
      }),
    });
    expect(confirmResponse.status).toBe(200);

    const loginResponse = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "recover@example.com",
        password: "MoviescoreSecure#456",
      }),
    });
    expect(loginResponse.status).toBe(200);
  });

  it("rotates refresh tokens and rejects replay of old refresh tokens", async () => {
    const registerResponse = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "refresh@example.com",
        displayName: "Refresh User",
        password: "MoviescoreSecure#123",
      }),
    });
    expect(registerResponse.status).toBe(201);

    const firstCookie = parseCookieHeader(registerResponse.headers);

    const refreshResponse = await app.request("/api/auth/refresh", {
      method: "POST",
      headers: { cookie: firstCookie, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(refreshResponse.status).toBe(200);

    const secondCookie = parseCookieHeader(refreshResponse.headers);
    expect(secondCookie).toContain("moviescore_refresh=");

    const replayOldRefresh = await app.request("/api/auth/refresh", {
      method: "POST",
      headers: { cookie: firstCookie, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(replayOldRefresh.status).toBe(401);
  });
});
