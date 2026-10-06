import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  FULFILLMENT_LABEL,
  getMyOrder,
  PAYMENT_LABEL,
  type CustomerOrder,
} from "@/lib/payments/orders";
import { formatBDT } from "@/data/artworks";
import { ArrowIcon } from "@/components/Icons";
import styles from "../../account.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });

/** SSLCommerz reports the instrument as one hyphenated string —
    "BKASH-bKash", "VISA-Dutch Bangla Bank" — which is not how anyone says it. */
function methodLabel(order: CustomerOrder): string {
  if (!order.cardType) {
    return order.paymentStatus === "paid" ? "Online payment" : "Not taken";
  }
  const [scheme, ...rest] = order.cardType.split("-");
  const issuer = order.cardIssuer || rest.join("-");
  return issuer ? `${scheme.trim()} · ${issuer.trim()}` : scheme.trim();
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/signin?next=/account/orders/${orderNumber}`);

  // No ownership check is written here on purpose: getMyOrder reads through
  // the customer's own session, so RLS turns somebody else's order number
  // into a 404 rather than a leak.
  const order = await getMyOrder(orderNumber);
  if (!order) notFound();

  const place = [order.address, order.city, order.postcode, order.country]
    .filter(Boolean)
    .join(", ");

  return (
    <section className={styles.section}>
      <div className="wrap">
        <Link href="/account" className={styles.back}>
          <ArrowIcon size={13} /> Back to your profile
        </Link>

        <header className={styles.detailHead}>
          <div>
            <span className="kicker">Order</span>
            <h1>{order.orderNumber}</h1>
            <div className={styles.badges}>
              <span
                className={`${styles.badge} ${
                  order.paymentStatus === "paid"
                    ? styles.badgePaid
                    : order.paymentStatus === "pending"
                      ? styles.badgePending
                      : styles.badgeDead
                }`}
              >
                {PAYMENT_LABEL[order.paymentStatus]}
              </span>
              {order.paymentStatus === "paid" && (
                <span className={styles.badge}>
                  {FULFILLMENT_LABEL[order.fulfillmentStatus]}
                </span>
              )}
            </div>
          </div>

          <div className={styles.detailActions}>
            <a
              href={`/api/orders/${order.orderNumber}/invoice`}
              className={`${styles.btn} ${styles.btnPrimary}`}
              download
            >
              Download invoice
            </a>
            {order.paymentStatus !== "paid" && (
              <Link href="/artworks" className={styles.btn}>
                Browse works
              </Link>
            )}
          </div>
        </header>

        <div className={styles.grid}>
          <aside className={`${styles.panel} ${styles.sticky}`}>
            <div className={styles.panelHead}>
              <span>Payment</span>
            </div>

            <dl className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <dt>Placed</dt>
                <dd>{dateTime(order.createdAt)}</dd>
              </div>
              {order.paidAt && order.paymentStatus === "paid" && (
                <div className={styles.summaryRow}>
                  <dt>Paid</dt>
                  <dd>{dateTime(order.paidAt)}</dd>
                </div>
              )}
              <div className={styles.summaryRow}>
                <dt>Method</dt>
                <dd>{methodLabel(order)}</dd>
              </div>
              <div className={styles.summaryRow}>
                <dt>Gateway</dt>
                <dd>SSLCommerz</dd>
              </div>
              {order.paymentStatus === "refunded" && order.refundAmount != null && (
                <div className={styles.summaryRow}>
                  <dt>Refunded</dt>
                  <dd>
                    {formatBDT(order.refundAmount)}
                    {order.refundedAt && <> · {dateTime(order.refundedAt)}</>}
                  </dd>
                </div>
              )}
              {order.tranId && (
                <div className={styles.summaryRow}>
                  <dt>Transaction</dt>
                  <dd className={styles.mono}>{order.tranId}</dd>
                </div>
              )}
              {order.bankTranId && (
                <div className={styles.summaryRow}>
                  <dt>Bank ref</dt>
                  <dd className={styles.mono}>{order.bankTranId}</dd>
                </div>
              )}
            </dl>

            <div className={styles.panelHead} style={{ marginTop: 26 }}>
              <span>Delivered to</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.detailLabel}>Name</span>
              <span className={styles.detailValue}>{order.customerName}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Phone</span>
              <span className={styles.detailValue}>
                {order.phone || <em className={styles.detailEmpty}>Not given</em>}
              </span>
            </div>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Address</span>
              <span className={styles.detailValue}>
                {place || <em className={styles.detailEmpty}>Collection from the gallery</em>}
              </span>
            </div>

            {order.paymentStatus === "refunded" && (
              <p className={styles.pendingNote}>
                This order has been refunded through SSLCommerz. Depending on your bank or wallet,
                it can take a few working days for the money to appear in your account.
              </p>
            )}

            {order.paymentStatus === "pending" && (
              <p className={styles.pendingNote}>
                This order has not been paid. Nothing has been charged, and the works are still
                available to others until it settles.
              </p>
            )}
          </aside>

          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span>
                {order.items.length} {order.items.length === 1 ? "work" : "works"}
              </span>
            </div>

            <ul className={styles.itemList}>
              {order.items.map((item) => (
                <li key={item.id} className={styles.item}>
                  {item.photoUrl && (
                    <span className={styles.itemThumb}>
                      <Image src={item.photoUrl} alt="" width={156} height={192} />
                    </span>
                  )}
                  <span className={styles.itemBody}>
                    <span className={styles.itemArtist}>{item.artist}</span>
                    {/* Not a link: there is no per-artwork page on the site,
                        and a piece the customer now owns has been retired from
                        the catalogue anyway. */}
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemMeta}>
                      {[item.medium, item.year].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className={styles.itemPrice}>{formatBDT(item.price)}</span>
                </li>
              ))}
            </ul>

            <div className={styles.grandRow}>
              <span>
                Total{" "}
                {order.paymentStatus === "paid" || order.paymentStatus === "refunded" ? "paid" : "due"}
              </span>
              <strong>{formatBDT(order.totalAmount)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
