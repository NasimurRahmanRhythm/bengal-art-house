import type { Metadata } from "next";
import Link from "next/link";
import { getMyOrder } from "@/lib/payments/orders";
import { formatBDT } from "@/data/artworks";
import { ArrowIcon } from "@/components/Icons";
import ClearCart from "./ClearCart";
import styles from "./result.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

type Status = "success" | "failed" | "cancelled" | "pending" | "refunded";

const COPY: Record<
  Status,
  { title: string; lead: string; tone: "good" | "bad" | "neutral" }
> = {
  success: {
    title: "Payment received",
    lead: "Thank you. Your acquisition is confirmed and the gallery has been notified. A record of this order, and its invoice, is in your profile.",
    tone: "good",
  },
  failed: {
    title: "The payment did not go through",
    lead: "Nothing has been charged. This is usually the bank declining the transaction rather than anything wrong with the order — your selection is still in your basket, so you can try again with another method.",
    tone: "bad",
  },
  cancelled: {
    title: "Payment cancelled",
    lead: "You left the gateway before paying, and nothing has been charged. Your selection is still waiting whenever you want to come back to it.",
    tone: "neutral",
  },
  refunded: {
    title: "This order was refunded",
    lead: "The gallery has refunded this order through SSLCommerz. The details are in your profile; depending on your bank or wallet, the money can take a few working days to appear.",
    tone: "neutral",
  },
  pending: {
    title: "Confirming your payment",
    lead: "We have not had final word from the gateway yet. If money has left your account the order will settle on its own within a few minutes — this page is safe to leave, and your profile will show the result.",
    tone: "neutral",
  },
};

function readStatus(raw: string | undefined): Status {
  if (raw === "success" || raw === "paid") return "success";
  if (raw === "failed") return "failed";
  if (raw === "cancelled") return "cancelled";
  if (raw === "refunded") return "refunded";
  return "pending";
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; order?: string }>;
}) {
  const params = await searchParams;
  const status = readStatus(params.status);
  const copy = COPY[status];

  // The query string says what the gateway told us; the order row says what
  // actually happened. Where they disagree — a customer reloading an old
  // success URL after a refund, say — the database wins.
  const order = params.order ? await getMyOrder(params.order) : null;
  const confirmed = order ? order.paymentStatus === "paid" : status === "success";

  const shown = order
    ? readStatus(order.paymentStatus === "paid" ? "success" : order.paymentStatus)
    : status;
  const shownCopy = COPY[shown];

  return (
    <section className={styles.section}>
      {confirmed && <ClearCart />}

      <div className="wrap">
        <div
          className={`${styles.card} ${
            shownCopy.tone === "good"
              ? styles.cardGood
              : shownCopy.tone === "bad"
                ? styles.cardBad
                : ""
          }`}
        >
          <span
            className={`${styles.mark} ${
              shownCopy.tone === "good"
                ? styles.markGood
                : shownCopy.tone === "bad"
                  ? styles.markBad
                  : ""
            }`}
            aria-hidden="true"
          >
            <StatusMark tone={shownCopy.tone} />
          </span>

          <span className="kicker">Checkout</span>
          <h1>{shownCopy.title}</h1>
          <p className={styles.lead}>{shownCopy.lead}</p>

          {order && (
            <>
              <dl className={styles.receipt}>
                <div className={styles.receiptRow}>
                  <dt>Order</dt>
                  <dd className={styles.mono}>{order.orderNumber}</dd>
                </div>
                <div className={styles.receiptRow}>
                  <dt>Total</dt>
                  <dd className={styles.amount}>{formatBDT(order.totalAmount)}</dd>
                </div>
                {order.tranId && (
                  <div className={styles.receiptRow}>
                    <dt>Transaction</dt>
                    <dd className={styles.mono}>{order.tranId}</dd>
                  </div>
                )}
                {order.bankTranId && (
                  <div className={styles.receiptRow}>
                    <dt>Bank reference</dt>
                    <dd className={styles.mono}>{order.bankTranId}</dd>
                  </div>
                )}
              </dl>

              {order.items.length > 0 && (
                <ul className={styles.works}>
                  {order.items.map((item) => (
                    <li key={item.id} className={styles.work}>
                      <span>
                        <span className={styles.workArtist}>{item.artist}</span>
                        {item.title}
                      </span>
                      <span className={styles.workPrice}>{formatBDT(item.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div className={styles.actions}>
            {order ? (
              <>
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  View this order <ArrowIcon size={14} />
                </Link>
                {order.paymentStatus === "paid" && (
                  <a
                    href={`/api/orders/${order.orderNumber}/invoice`}
                    className={styles.btn}
                    download
                  >
                    Download invoice
                  </a>
                )}
              </>
            ) : (
              <Link href="/account" className={`${styles.btn} ${styles.btnPrimary}`}>
                Go to your profile <ArrowIcon size={14} />
              </Link>
            )}

            {shown === "failed" || shown === "cancelled" ? (
              <Link href="/checkout" className={styles.btn}>
                Try again
              </Link>
            ) : (
              <Link href="/artworks" className={styles.btn}>
                Continue browsing
              </Link>
            )}
          </div>

          {!order && params.order && (
            <p className={styles.note}>
              Order <strong>{params.order}</strong> could not be shown here — you may need to sign
              in again to see it. Nothing about the payment is affected.
            </p>
          )}

          {shown === "success" && (
            <p className={styles.note}>
              A member of the gallery will be in touch about delivery or collection. Every
              acquisition is backed by the gallery&apos;s provenance and authentication service.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function StatusMark({ tone }: { tone: "good" | "bad" | "neutral" }) {
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      {tone === "good" && <path d="M5 12.5l4.5 4.5L19 7.5" {...stroke} />}
      {tone === "bad" && <path d="M7 7l10 10M17 7L7 17" {...stroke} />}
      {tone === "neutral" && (
        <>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <path d="M12 8v4.5l3 1.8" {...stroke} />
        </>
      )}
    </svg>
  );
}
