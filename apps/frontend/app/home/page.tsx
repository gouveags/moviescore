"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMe, logout, refreshSession, type AuthUser } from "../../lib/auth-api";

type HomeState =
  | { kind: "loading" }
  | { kind: "unauthenticated"; message: string }
  | { kind: "ready"; user: AuthUser };

export default function HomePage() {
  const [state, setState] = useState<HomeState>({ kind: "loading" });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    const resolveSession = async () => {
      const firstTry = await getMe();
      if (firstTry.status === 200 && firstTry.data.user) {
        if (mounted) {
          setState({ kind: "ready", user: firstTry.data.user });
        }
        return;
      }

      if (firstTry.status === 401) {
        const refresh = await refreshSession();
        if (refresh.status === 200) {
          const secondTry = await getMe();
          if (mounted && secondTry.status === 200 && secondTry.data.user) {
            setState({ kind: "ready", user: secondTry.data.user });
            return;
          }
        }
      }

      if (mounted) {
        setState({ kind: "unauthenticated", message: "You are not signed in." });
      }
    };

    void resolveSession();
    return () => {
      mounted = false;
    };
  }, []);

  const greeting = useMemo(() => {
    if (state.kind !== "ready") {
      return null;
    }
    return `Welcome back, ${state.user.displayName}.`;
  }, [state]);

  const onLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    window.location.href = "/login";
  };

  if (state.kind === "loading") {
    return (
      <main className="auth-shell" id="main-content">
        <section className="auth-card">
          <h1>Loading your taste graph...</h1>
        </section>
      </main>
    );
  }

  if (state.kind === "unauthenticated") {
    return (
      <main className="auth-shell" id="main-content">
        <section className="auth-card" aria-labelledby="not-auth-heading">
          <h1 id="not-auth-heading">{state.message}</h1>
          <p className="auth-copy">Sign in to access your private recommendation workspace.</p>
          <div className="auth-links auth-links-inline">
            <Link href="/login">Sign in</Link>
            <Link href="/register">Create account</Link>
            <Link href="/">Back to landing</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-home" id="main-content">
      <section className="welcome-panel" aria-labelledby="welcome-heading">
        <p className="eyebrow">MovieScore home</p>
        <h1 id="welcome-heading">{greeting}</h1>
        <p className="auth-copy">
          Your rail is warming up. Next up: expectation intelligence, delta signals, and better
          picks with less browsing.
        </p>
        <div className="cta-row">
          <Link className="btn btn-secondary" href="/">
            Explore landing
          </Link>
          <button
            className="btn btn-primary"
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </section>
    </main>
  );
}
