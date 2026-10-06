"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/admin/AdminShell";
import { Badge, Empty } from "@/components/admin/ui";
import { SearchIcon } from "@/components/admin/Icons";
import OrderDetails, {
  FULFILLMENT_LABEL,
  PAYMENT_LABEL,
  PAYMENT_TONE,
} from "@/components/admin/OrderDetails";
import { useAdmin, useCounts } from "@/lib/admin/store";
import { formatBDT, formatDate } from "@/lib/admin/slug";
import { paymentMethod, type PaymentStatus } from "@/lib/admin/types";

const FILTERS: { value: PaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Awaiting payment" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export default function Orders() {
  const { data } = useAdmin();
  const c = useCounts();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...data.orders]
      .filter((o) => {
        if (filter !== "all" && o.paymentStatus !== filter) return false;
        if (!needle) return true;
        // Searching by transaction ID matters: it is the one string a customer
        // can quote back from their bank statement.
        return `${o.orderNumber} ${o.customerName} ${o.email} ${o.phone} ${o.tranId ?? ""}`
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data.orders, q, filter]);

  const counts = useMemo(
    () => ({
      all: data.orders.length,
      paid: data.orders.filter((o) => o.paymentStatus === "paid").length,
      pending: data.orders.filter((o) => o.paymentStatus === "pending").length,
      failed: data.orders.filter((o) => o.paymentStatus === "failed").length,
      refunded: data.orders.filter((o) => o.paymentStatus === "refunded").length,
    }),
    [data.orders],
  );

  // Held in state by id rather than by object, so the panel re-reads the row
  // after a status change instead of showing a stale copy.
  const open = openId ? (data.orders.find((o) => o.id === openId) ?? null) : null;

  return (
    <>
      <Topbar title="Orders" />

      <div className="a-body">
        <div className="a-cards">
          <div className="a-stat">
            <span className="a-statLabel">Taken</span>
            <span className="a-statValue" style={{ fontSize: 21 }}>
              {formatBDT(c.revenue)}
            </span>
            <span className="a-statNote">
              {counts.paid} paid orders
              {counts.refunded > 0 && `, net of ${counts.refunded} refunded`}
            </span>
          </div>
          <div className="a-stat">
            <span className="a-statLabel">To send out</span>
            <span
              className="a-statValue"
              style={{ color: c.toFulfil ? "var(--a-accent)" : undefined }}
            >
              {c.toFulfil}
            </span>
            <span className="a-statNote">Paid, not yet completed</span>
          </div>
          <div className="a-stat">
            <span className="a-statLabel">Awaiting payment</span>
            <span className="a-statValue">{counts.pending}</span>
            <span className="a-statNote">Left at the gateway</span>
          </div>
        </div>

        <div className="a-toolbar">
          <div className="a-search">
            <SearchIcon className="a-searchIcon" />
            <input
              className="a-input"
              placeholder="Search order no., name, email, transaction ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="a-chips">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className="a-chip"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.label} ({counts[f.value]})
              </button>
            ))}
          </div>
        </div>

        <div className="a-card">
          {rows.length === 0 ? (
            <Empty title={q || filter !== "all" ? "Nothing matches" : "No orders yet"}>
              <p>
                {q || filter !== "all"
                  ? "Try a different search or filter."
                  : "Orders paid for through SSLCommerz will land here."}
              </p>
            </Empty>
          ) : (
            <div className="a-tableWrap">
              {/* Deliberately short: order, who, what it cost, how it was paid,
                  where it stands. Everything else is one click away in the
                  panel, so the list stays scannable at a glance. */}
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                    <th>Paid with</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => {
                    const method = paymentMethod(o);
                    return (
                      <tr key={o.id}>
                        <td>
                          <button
                            type="button"
                            className="a-rowTitle a-linkBtn a-num"
                            onClick={() => setOpenId(o.id)}
                          >
                            {o.orderNumber}
                          </button>
                          <div className="a-rowSub">{formatDate(o.createdAt)}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{o.customerName}</div>
                          <div className="a-rowSub">
                            {o.items.length === 1 ? "1 piece" : `${o.items.length} pieces`}
                          </div>
                        </td>
                        <td className="a-rowSub">{o.email}</td>
                        <td className="a-num" style={{ textAlign: "right" }}>
                          {formatBDT(o.totalAmount)}
                        </td>
                        <td>
                          {method.label}
                          {method.issuer && <div className="a-rowSub">{method.issuer}</div>}
                        </td>
                        <td>
                          <div className="a-stack">
                            <Badge
                              tone={PAYMENT_TONE[o.paymentStatus]}
                              dot={o.paymentStatus === "paid"}
                            >
                              {PAYMENT_LABEL[o.paymentStatus]}
                            </Badge>
                            {o.paymentStatus === "paid" && (
                              <span className="a-rowSub">
                                {FULFILLMENT_LABEL[o.fulfillmentStatus]}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="a-rowActions">
                            <button
                              type="button"
                              className="a-btn"
                              data-size="sm"
                              onClick={() => setOpenId(o.id)}
                            >
                              View details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="a-hint">
          Orders are created by the gateway, never by hand — the only things editable here are the
          gallery&apos;s own steps: marking a paid order shipped or completed, and recording a refund
          once it has been sent from the SSLCommerz merchant panel.
        </p>
      </div>

      {open && <OrderDetails order={open} onClose={() => setOpenId(null)} />}
    </>
  );
}
