"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowIcon, EyeIcon } from "@/components/Icons";
import styles from "@/components/auth/AuthCard.module.css";

/** Where to land once signed in. Read off window rather than through
 *  useSearchParams so this page needs no Suspense boundary and stays
 *  statically renderable.
 *
 *  Only same-origin paths are honoured: a `next` of "//evil.example" is a
 *  protocol-relative URL, and accepting one would turn the sign-in form into
 *  an open redirect. */
function nextPath(): string {
  if (typeof window === "undefined") return "/";
  const raw = new URLSearchParams(window.location.search).get("next");
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

export default function SignInPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : signInError.message
      );
      return;
    }

    router.push(nextPath());
    router.refresh();
  };

  return (
    <section className={styles.section}>
      <div className={`wrap ${styles.cardOuter}`}>
        <div className={styles.card}>
          <div className={styles.head}>
            <span className="kicker">Welcome back</span>
            <h1>Sign in</h1>
            <p>Sign in with the email and password you used to create your account.</p>
          </div>

          <form className={styles.form} onSubmit={onSubmit}>
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
                  autoComplete="current-password"
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

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
              <ArrowIcon size={15} />
            </button>
          </form>

          <div className={styles.foot}>
            <span>New to the gallery?</span>
            <Link href="/signup">Create an account</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
