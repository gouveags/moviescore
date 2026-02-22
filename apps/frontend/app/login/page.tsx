"use client";

import React, { useState } from "react";
import Link from "next/link";
import { login } from "../../lib/auth-api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showTwoFactorFields, setShowTwoFactorFields] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await login({
      email,
      password,
      ...(totpCode.trim() ? { totpCode: totpCode.trim() } : {}),
      ...(recoveryCode.trim() ? { recoveryCode: recoveryCode.trim() } : {}),
    });

    setSubmitting(false);
    if (response.status !== 200 || !response.data.user) {
      if (response.data.error?.toLowerCase().includes("two-factor")) {
        setShowTwoFactorFields(true);
      }
      setError(response.data.error ?? "Sign in failed.");
      return;
    }

    window.location.href = "/home";
  };

  return (
    <main className="auth-shell" id="main-content">
      <section className="auth-card" aria-labelledby="login-heading">
        <p className="eyebrow">MovieScore access</p>
        <h1 id="login-heading">Sign in</h1>
        <p className="auth-copy">
          Back in the cockpit. Sessions rotate securely, and two-factor keeps the door locked.
        </p>
        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="field-input"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="field-input"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button
            className="auth-link-button"
            type="button"
            onClick={() => setShowTwoFactorFields((value) => !value)}
            aria-expanded={showTwoFactorFields}
          >
            {showTwoFactorFields ? "Hide two-factor options" : "Use two-factor options"}
          </button>

          {showTwoFactorFields ? (
            <div className="advanced-security" role="group" aria-label="Two-factor options">
              <label className="field-label" htmlFor="totpCode">
                Authenticator code
              </label>
              <input
                id="totpCode"
                className="field-input"
                name="totpCode"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(event) => setTotpCode(event.target.value)}
              />

              <label className="field-label" htmlFor="recoveryCode">
                Recovery code
              </label>
              <input
                id="recoveryCode"
                className="field-input"
                name="recoveryCode"
                value={recoveryCode}
                onChange={(event) => setRecoveryCode(event.target.value)}
              />
            </div>
          ) : null}

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/recover">Forgot password</Link>
          <Link href="/register">Create account</Link>
          <Link href="/">Back to landing</Link>
        </div>
      </section>
    </main>
  );
}
