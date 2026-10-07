"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { formatBDT } from "@/data/artworks";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { ArrowIcon } from "@/components/Icons";
import styles from "./checkout.module.css";

// The instruments SSLCommerz offers on the hosted page. Listed here purely so
// the customer can see, before leaving the site, that their wallet is accepted.
const METHODS = ["bKash", "Nagad", "Rocket", "Upay", "Visa", "Mastercard", "Amex", "Net banking"];

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { lines, count, total } = useCart();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  // SSLCommerz requires this box, unticked by default and ticked by the
  // customer themselves, before an order can be placed.
  const [agreed, setAgreed] = useState(false);

  const [prefilled, setPrefilled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Whatever the customer gave last time is offered again — a returning buyer
  // should not retype their own name to buy a second piece.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.full_name) setName((v) => v || data.full_name);
        if (data?.phone) setPhone((v) => v || data.phone);
        setPrefilled(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("Please read and agree to the terms and policies before paying.");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => l.id),
          name,
          phone,
          address,
          city,
          postcode,
          agreed,
        }),
      });

      const payload = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !payload.url) {
        setError(payload.error ?? "Could not start the payment. Please try again.");
        setSubmitting(false);
        return;
      }

      // The cart is deliberately NOT cleared here. If the customer abandons
      // the gateway page their selection is still waiting for them; it is the
      // confirmation page that empties it, and only on a real payment.
      window.location.href = payload.url;
    } catch {
      setError("Could not reach the gallery. Check your connection and try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className="wrap">
          <p className={styles.hint}>Loading…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.gate}>
            <span className="kicker">Checkout</span>
            <h1>Sign in to continue</h1>
            <p>
              An account keeps your order history, your invoices and the gallery&apos;s record of
              what you own in one place. It takes a moment to create.
            </p>
            <div className={styles.gateActions}>
              <Link href="/signin?next=/checkout" className={`${styles.btn} ${styles.btnPrimary}`}>
                Sign in <ArrowIcon size={14} />
              </Link>
              <Link href="/signup?next=/checkout" className={styles.btn}>
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (count === 0) {
    return (
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.gate}>
            <span className="kicker">Checkout</span>
            <h1>Nothing selected</h1>
            <p>Your selection is empty. Browse the works available for acquisition.</p>
            <div className={styles.gateActions}>
              <Link href="/artworks" className={`${styles.btn} ${styles.btnPrimary}`}>
                Explore artworks <ArrowIcon size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className="wrap">
        <header className={styles.head}>
          <span className="kicker">Checkout</span>
          <h1>Complete your acquisition</h1>
          <p>
            Payment is taken by SSLCommerz — the gallery never sees your card or wallet details.
            You will be returned here as soon as the payment clears.
          </p>
        </header>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <h2 className={styles.panelHead}>Your details</h2>

            <form className={styles.form} onSubmit={onSubmit}>
              <label className={styles.field}>
                <span>
                  Full name <em className={styles.req}>*</em>
                </span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  placeholder={prefilled ? undefined : "As it should appear on the invoice"}
                />
              </label>

              <div className={styles.row}>
                <label className={styles.field}>
                  <span>
                    Phone <em className={styles.req}>*</em>
                  </span>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={submitting}
                    placeholder="01XXXXXXXXX"
                  />
                </label>

                <label className={styles.field}>
                  <span>Email</span>
                  <input type="email" value={user.email ?? ""} disabled readOnly />
                </label>
              </div>

              <label className={styles.field}>
                <span>Delivery address</span>
                <textarea
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={submitting}
                  placeholder="House, road, area"
                />
              </label>

              <div className={styles.row}>
                <label className={styles.field}>
                  <span>City</span>
                  <input
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={submitting}
                    placeholder="Dhaka"
                  />
                </label>

                <label className={styles.field}>
                  <span>Post code</span>
                  <input
                    type="text"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    disabled={submitting}
                    placeholder="1209"
                  />
                </label>
              </div>

              <p className={styles.hint}>
                Your name and phone number are saved to your profile so the gallery can reach you
                about delivery. Large sculpture is delivered and installed by arrangement.
              </p>

              {/* The policy links open in a new tab so reading them does not
                  throw away what has been typed into the form. */}
              <label className={styles.agree}>
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  disabled={submitting}
                />
                <span>
                  I have read and agree to the{" "}
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
                {submitting ? "Opening the gateway…" : `Pay ${formatBDT(total)}`}
                {!submitting && <ArrowIcon size={15} />}
              </button>
            </form>
          </div>

          <aside className={`${styles.panel} ${styles.summary}`}>
            <h2 className={styles.panelHead}>
              {count} {count === 1 ? "work" : "works"}
            </h2>

            <ul className={styles.lines}>
              {lines.map((line) => (
                <li key={line.id} className={styles.line}>
                  <span className={styles.thumb}>
                    {line.photo ? (
                      <Image src={line.photo} alt="" width={108} height={136} />
                    ) : (
                      <ArtPlate variant={line.plate} />
                    )}
                  </span>
                  <span className={styles.lineBody}>
                    <span className={styles.lineArtist}>{line.artist}</span>
                    <span className={styles.lineTitle}>{line.title}</span>
                    <span className={styles.linePrice}>{formatBDT(line.price)}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Delivery</span>
                <span>Arranged by the gallery</span>
              </div>
              <div className={styles.grand}>
                <span>Total</span>
                <strong>{formatBDT(total)}</strong>
              </div>
            </div>

            <div className={styles.gateways}>
              Pay with any method SSLCommerz supports:
              <div className={styles.gatewayList}>
                {METHODS.map((m) => (
                  <span key={m} className={styles.chip}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
