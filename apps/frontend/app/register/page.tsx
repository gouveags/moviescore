"use client";

import React, { useState } from "react";
import Link from "next/link";
import { register } from "../../lib/auth-api";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await register({
      displayName,
      email,
      password,
    });

    setSubmitting(false);
    if (response.status !== 201 || !response.data.user) {
      setError(response.data.error ?? "Registration failed.");
      return;
    }

    window.location.href = "/home";
  };

  return (
    <main className="auth-shell" id="main-content">
      <section className="auth-card" aria-labelledby="register-heading">
        <p className="eyebrow">MovieScore onboarding</p>
        <h1 id="register-heading">Create account</h1>
        <p className="auth-copy">
          Start tracking expectation vs reality now. Security stays on by default, not as an
          optional extra.
        </p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field-label" htmlFor="displayName">
            Name
          </label>
          <input
            id="displayName"
            className="field-input"
            name="displayName"
            autoComplete="name"
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />

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
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/login">Sign in</Link>
          <Link href="/">Back to landing</Link>
        </div>
      </section>
    </main>
  );
}
