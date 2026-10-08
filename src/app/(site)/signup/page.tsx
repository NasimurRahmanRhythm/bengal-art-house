"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowIcon, EyeIcon } from "@/components/Icons";
import OtpInput from "@/components/auth/OtpInput";
import styles from "@/components/auth/AuthCard.module.css";

const RESEND_COOLDOWN = 30;

/** Where to land once the account is confirmed. Same-origin paths only —
 *  see the matching note on the sign-in page. */
function nextPath(): string {
  if (typeof window === "undefined") return "/";
  const raw = new URLSearchParams(window.location.search).get("next");
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

export default function SignUpPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Unticked by default and ticked by the person signing up — the same
  // agreement SSLCommerz requires at the cart and at checkout.
  const [agreed, setAgreed] = useState(false);
  const [code, setCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const onSubmitDetails = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the terms and policies to create an account.");
      return;
    }

    setSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Confirmed accounts on this address re-signing up get a user back with
    // no identities and no error — Supabase's way of not confirming whether
    // an email exists, without ever sending a code for one that already does.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("This email is already registered. Try signing in instead.");
      return;
    }

    setStep("otp");
    setCooldown(RESEND_COOLDOWN);
  };

  // Takes the code as an argument rather than reading state: when the last
  // box auto-submits, setCode() has not re-rendered yet and `code` would
  // still be five digits long.
  const confirmCode = async (token: string) => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    setSubmitting(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.push(nextPath());
    router.refresh();
  };

  const onSubmitCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    confirmCode(code);
  };

  const resendCode = async () => {
    if (cooldown > 0) return;
    setError(null);
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setNotice("A new code is on its way.");
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <section className={styles.section}>
      <div className={`wrap ${styles.cardOuter}`}>
        <div className={styles.card}>
          {step === "form" ? (
            <>
              <div className={styles.head}>
                <span className="kicker">Create account</span>
                <h1>Join the gallery</h1>
                <p>Sign up to save enquiries and track orders. We&apos;ll email a code to confirm your address.</p>
              </div>

              <form className={styles.form} onSubmit={onSubmitDetails}>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                </label>

                <label className={styles.field}>
                  <span>Password</span>
                  <div className={styles.passwordWrap}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon size={16} />
                    </button>
                  </div>
                </label>

                <label className={styles.field}>
                  <span>Confirm password</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={submitting}
                  />
                </label>

                {/* The links open in a new tab so reading them does not lose
                    what has been typed into the form. */}
                <label className={styles.agree}>
                  <input
                    type="checkbox"
                    required
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (e.target.checked) setError(null);
                    }}
                    disabled={submitting}
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" rel="noopener">
                      Terms &amp; Conditions
                    </Link>
                    ,{" "}
                    <Link href="/privacy-policy" target="_blank" rel="noopener">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/refund-policy" target="_blank" rel="noopener">
                      Return &amp; Refund Policy
                    </Link>
                    .
                  </span>
                </label>

                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}

                <button type="submit" className={styles.submit} disabled={submitting}>
                  {submitting ? "Sending code…" : "Create account"}
                  <ArrowIcon size={15} />
                </button>
              </form>
            </>
          ) : (
            <>
              <div className={styles.head}>
                <span className="kicker">Confirm email</span>
                <h1>Enter the code</h1>
                <p>
                  We sent a 6-digit code to <strong>{email}</strong>. Enter it below to finish
                  creating your account.
                </p>
              </div>

              <form className={styles.form} onSubmit={onSubmitCode}>
                <div className={styles.field}>
                  <span>Verification code</span>
                  <OtpInput
                    value={code}
                    onChange={(v) => {
                      setCode(v);
                      setError(null);
                    }}
                    // The last digit submits, the way OTP fields usually do;
                    // the button stays for anyone who prefers to press it.
                    onComplete={confirmCode}
                    disabled={submitting}
                    invalid={!!error}
                    autoFocus
                  />
                </div>

                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}
                {notice && !error && <p className={styles.notice}>{notice}</p>}

                <button
                  type="submit"
                  className={styles.submit}
                  disabled={submitting || code.length !== 6}
                >
                  {submitting ? "Confirming…" : "Confirm & sign up"}
                  <ArrowIcon size={15} />
                </button>

                <p className={styles.hint}>
                  Didn&apos;t get it?{" "}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={resendCode}
                    disabled={cooldown > 0}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </p>
              </form>
            </>
          )}

          <div className={styles.foot}>
            <span>Already have an account?</span>
            <Link href="/signin">Sign in</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
