"use client";

import React, { useState } from "react";
import Link from "next/link";
import { confirmRecovery, requestRecovery } from "../../lib/auth-api";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const onRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRequestError(null);
    setRequestStatus(null);

    const response = await requestRecovery(email);
    if (response.status !== 200 || !response.data.ok) {
      setRequestError(response.data.error ?? "Could not create recovery token.");
      return;
    }

    setRequestStatus("Recovery request accepted. Check your inbox.");
    if (response.data.resetToken) {
      setResetToken(response.data.resetToken);
      setRequestStatus("Local dev token generated for quick testing.");
    }
  };

  const onConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmError(null);
    setConfirmStatus(null);

    const response = await confirmRecovery({ resetToken, newPassword });
    if (response.status !== 200 || !response.data.ok) {
      setConfirmError(response.data.error ?? "Could not reset password.");
      return;
    }

    setConfirmStatus("Password reset done. You can sign in now.");
  };

  return (
    <main className="auth-shell" id="main-content">
      <section className="auth-card" aria-labelledby="recover-heading">
        <p className="eyebrow">MovieScore recovery</p>
        <h1 id="recover-heading">Recover account</h1>
        <p className="auth-copy">
          Lost your password? Recover fast and get back in. One-time token, then a strong reset.
        </p>

        <form className="auth-form" onSubmit={onRequest}>
          <label className="field-label" htmlFor="recovery-email">
            Account email
          </label>
          <input
            id="recovery-email"
            className="field-input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="btn btn-secondary auth-submit" type="submit">
            Send recovery email
          </button>
          {requestStatus ? <p className="form-success">{requestStatus}</p> : null}
          {requestError ? (
            <p className="form-error" role="alert">
              {requestError}
            </p>
          ) : null}
        </form>

        <form className="auth-form split-top" onSubmit={onConfirm}>
          <label className="field-label" htmlFor="recovery-token">
            Recovery token
          </label>
          <input
            id="recovery-token"
            className="field-input"
            required
            value={resetToken}
            onChange={(event) => setResetToken(event.target.value)}
          />

          <label className="field-label" htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            className="field-input"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          <button className="btn btn-primary auth-submit" type="submit">
            Set new password
          </button>
          {confirmStatus ? <p className="form-success">{confirmStatus}</p> : null}
          {confirmError ? (
            <p className="form-error" role="alert">
              {confirmError}
            </p>
          ) : null}
        </form>

        <div className="auth-links">
          <Link href="/login">Back to sign in</Link>
          <Link href="/">Back to landing</Link>
        </div>
      </section>
    </main>
  );
}
