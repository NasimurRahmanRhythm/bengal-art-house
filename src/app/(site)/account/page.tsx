import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMyOrders, PAYMENT_LABEL, type CustomerOrder } from "@/lib/payments/orders";
import { formatBDT } from "@/data/artworks";
import { formatLongDate } from "@/lib/content";
import { ArrowIcon } from "@/components/Icons";
import ProfileCard from "./ProfileCard";
import styles from "./account.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false, follow: false },
};

const badgeClass = (status: CustomerOrder["paymentStatus"]) =>
  status === "paid"
    ? styles.badgePaid
    : status === "pending"
      ? styles.badgePending
      : styles.badgeDead;

/** Names an order by what is in it — "Bird Study II" reads better on a list of
    past purchases than "3 items", and the count only appears when it has to. */
function describe(order: CustomerOrder): { lead: string; more: string | null } {
  if (order.items.length === 0) return { lead: "This order", more: null };
  const [first, ...rest] = order.items;
  return {
    lead: first.title,
    more: rest.length ? `and ${rest.length} other ${rest.length === 1 ? "work" : "works"}` : null,
  };
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/account");

  const [{ data: profile }, orders] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, created_at").eq("id", user.id).maybeSingle(),
    listMyOrders(),
  ]);

  const paid = orders.filter((o) => o.paymentStatus === "paid");
  // What the customer is actually out of pocket: a partly refunded order
  // still counts for the part the gallery kept.
  const spent = orders.reduce(
    (sum, o) =>
      o.paymentStatus === "paid"
        ? sum + o.totalAmount
        : o.paymentStatus === "refunded"
          ? sum + o.totalAmount - (o.refundAmount ?? o.totalAmount)
          : sum,
    0,
  );
  const works = paid.reduce((sum, o) => sum + o.items.length, 0);

  return (
    <section className={styles.section}>
      <div className="wrap">
        <header className={styles.head}>
          <div>
            <span className="kicker">Your profile</span>
            <h1>{profile?.full_name || "Welcome"}</h1>
            <span className={styles.headMeta}>{user.email}</span>
          </div>
        </header>

        <div className={styles.grid}>
          <ProfileCard
            userId={user.id}
            email={user.email ?? ""}
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? ""}
            memberSince={formatLongDate(profile?.created_at ?? user.created_at)}
          />

          <div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Orders</span>
                <span className={styles.statValue}>{orders.length}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Works acquired</span>
                <span className={styles.statValue}>{works}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Total</span>
                <span className={styles.statValue}>{formatBDT(spent)}</span>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className={styles.empty}>
                <h2>No orders yet</h2>
                <p>
                  When you acquire a work through the gallery it will appear here, with its
                  invoice and the record of what was paid.
                </p>
                <Link href="/artworks" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Explore artworks <ArrowIcon size={14} />
                </Link>
              </div>
            ) : (
              <ul className={styles.orders}>
                {orders.map((order) => {
                  const { lead, more } = describe(order);
                  return (
                    <li key={order.id}>
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
                        className={styles.order}
                      >
                        <div className={styles.orderTop}>
                          <span className={styles.orderNo}>{order.orderNumber}</span>
                          <span className={styles.orderDate}>
                            {formatLongDate(order.createdAt)}
                          </span>
                        </div>

                        <div className={styles.orderBody}>
                          <span className={styles.orderWorks}>
                            {lead}
                            {more && <span className={styles.orderMore}>{more}</span>}
                          </span>

                          <span className={styles.orderRight}>
                            <span className={styles.orderTotal}>
                              {formatBDT(order.totalAmount)}
                            </span>
                            <span
                              className={`${styles.badge} ${badgeClass(order.paymentStatus)}`}
                            >
                              {PAYMENT_LABEL[order.paymentStatus]}
                            </span>
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
