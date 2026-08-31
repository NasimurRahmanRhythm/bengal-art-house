"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { requestCode, verifyCode } from "./actions";
import { ADMIN_SESSION_DAYS } from "@/lib/admin/session";

const RESEND_COOLDOWN = 45;

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Whether the visitor arrived here because their week ran out, rather than by
  // signing out — worth saying, because otherwise being thrown back to a login
  // screen mid-task looks like a fault.
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    setExpired(new URLSearchParams(window.location.search).get("expired") === "1");
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    setError("");
    setBusy(true);
    const res = await requestCode(email);
    setBusy(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }
    setNotice(res.message);
    setStep("code");
    setCooldown(RESEND_COOLDOWN);
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await verifyCode(email, code);

    if (!res.ok) {
      setBusy(false);
      setError(res.message);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="a-login">
      <div className="a-loginCard">
        <div className="a-loginHead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="a-brandMark" />
          <span className="a-brandText">
            <span className="a-brandTop">Gallery</span>
            <span className="a-brandName">Hamiduzzaman</span>
          </span>
        </div>

        {expired && step === "email" && (
          <p className="a-loginNotice">
            You were signed out after {ADMIN_SESSION_DAYS} days. Sign in again to carry on.
          </p>
        )}

        {step === "email" ? (
          <form onSubmit={send} noValidate>
            <h1 className="a-loginTitle">Sign in</h1>
            <p className="a-loginLede">
              Enter your email and we&apos;ll send you a six-digit code. There is no password to
              remember.
            </p>

            <label className="a-label" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              className="a-input"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            {error && <p className="a-formError">{error}</p>}

            <button type="submit" className="a-btn" data-variant="primary" disabled={busy}>
              {busy ? "Sending…" : "Email me a code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} noValidate>
            <h1 className="a-loginTitle">Enter the code</h1>
            <p className="a-loginLede">{notice}</p>

            <label className="a-label" htmlFor="admin-code">
              Six-digit code
            </label>
            <input
              id="admin-code"
              className="a-input a-codeInput"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
            />

            {error && <p className="a-formError">{error}</p>}

            <button type="submit" className="a-btn" data-variant="primary" disabled={busy}>
              {busy ? "Checking…" : "Sign in"}
            </button>

            <div className="a-loginFoot">
              <button
                type="button"
                className="a-linkBtn"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                }}
              >
                Use a different email
              </button>
              <button
                type="button"
                className="a-linkBtn"
                disabled={cooldown > 0 || busy}
                onClick={() => send()}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Send a new code"}
              </button>
            </div>
          </form>
        )}

        <p className="a-loginSmall">
          Signed-in sessions last {ADMIN_SESSION_DAYS} days.
        </p>
      </div>
    </main>
  );
}
