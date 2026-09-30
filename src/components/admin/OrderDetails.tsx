"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, ConfirmDelete, DetailRow, Modal } from "./ui";
import { CopyIcon, DownloadIcon, MailIcon } from "./Icons";
import { useAdmin, useArtistMap, useArtworkMap } from "@/lib/admin/store";
import { formatBDT, formatDateTime } from "@/lib/admin/slug";
import { paymentMethod, SETTLED_BY_LABEL, type Order } from "@/lib/admin/types";

// `cancelled` is carried here even though types.ts still types PaymentStatus
// as the original three. The payments migration added it to the database, and
// settle.ts writes it whenever a customer backs out at the gateway — so it
// arrives at runtime regardless, and without an entry the badge rendered
// blank. Indexing a four-key map with a three-value union is legal, which is
// why this fixes the display without dragging the filter row and its counts
// into a wider change.
export const PAYMENT_TONE = {
  paid: "good",
  pending: "warn",
  failed: "muted",
  cancelled: "muted",
} as const;

export const PAYMENT_LABEL = {
  paid: "Paid",
  pending: "Awaiting payment",
  failed: "Failed",
  cancelled: "Cancelled",
} as const;

export const FULFILLMENT_LABEL = {
  pending: "Not sent",
  shipped: "Shipped",
  completed: "Completed",
} as const;

/** Copy a gateway reference without selecting it by hand — these are the
    strings that get pasted into a support email or the SSLCommerz dashboard. */
function Ref({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  if (!value) return <span style={{ color: "var(--a-muted)" }}>—</span>;

  return (
    <button
      type="button"
      className="a-copy"
      title="Copy"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          },
          () => {},
        );
      }}
    >
      {value}
      <CopyIcon />
      {copied && <span className="a-copied">Copied</span>}
    </button>
  );
}

export default function OrderDetails({ order, onClose }: { order: Order; onClose: () => void }) {
  const { setPaymentStatus, setFulfillmentStatus, deleteOrder } = useAdmin();
  const artworks = useArtworkMap();
  const artists = useArtistMap();
  const method = paymentMethod(order);
  const g = order.gateway;

  // Fulfillment only ever moves forward, so one button is enough — it always
  // offers the next step rather than a status picker to think about.
  const nextStep =
    order.fulfillmentStatus === "pending"
      ? { label: "Mark shipped", value: "shipped" as const }
      : order.fulfillmentStatus === "shipped"
        ? { label: "Mark completed", value: "completed" as const }
        : null;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={order.orderNumber}
      subtitle={`Placed ${formatDateTime(order.createdAt)}`}
      footer={
        <>
          <a
            className="a-btn"
            data-size="sm"
            href={`mailto:${order.email}?subject=${encodeURIComponent(
              `Your order ${order.orderNumber} — Gallery Hamiduzzaman`,
            )}`}
          >
            <MailIcon size={14} /> Email customer
          </a>

          {/* Hidden on a failed or cancelled order: there is no document to
              issue for money that was never taken, and offering one invites
              sending a customer an invoice for a payment that never happened.
              A pending order still gets one — that is the pro-forma the
              gallery sends when someone asks to pay by other means, and the
              PDF prints AWAITING PAYMENT across it so it cannot be mistaken
              for a receipt. */}
          {(order.paymentStatus === "paid" || order.paymentStatus === "pending") && (
            <a
              className="a-btn"
              data-size="sm"
              href={`/api/admin/orders/${order.orderNumber}/invoice`}
              download={`invoice-${order.orderNumber}.pdf`}
            >
              <DownloadIcon size={14} /> Invoice
            </a>
          )}

          {order.paymentStatus === "paid" && nextStep && (
            <button
              type="button"
              className="a-btn"
              data-size="sm"
              data-variant="primary"
              onClick={() => setFulfillmentStatus(order.id, nextStep.value)}
            >
              {nextStep.label}
            </button>
          )}

          {order.paymentStatus === "pending" && (
            <button
              type="button"
              className="a-btn"
              data-size="sm"
              onClick={() => setPaymentStatus(order.id, "paid")}
            >
              Mark paid by hand
            </button>
          )}

          <span style={{ marginLeft: "auto" }}>
            <ConfirmDelete
              size="md"
              label="Delete order"
              onConfirm={() => {
                deleteOrder(order.id);
                onClose();
              }}
            />
          </span>
        </>
      }
    >
      <div className="a-statusRow">
        <Badge tone={PAYMENT_TONE[order.paymentStatus]} dot={order.paymentStatus === "paid"}>
          {PAYMENT_LABEL[order.paymentStatus]}
        </Badge>
        <Badge tone={order.fulfillmentStatus === "completed" ? "good" : "muted"}>
          {FULFILLMENT_LABEL[order.fulfillmentStatus]}
        </Badge>
        {g?.riskLevel === "1" && <Badge tone="warn">Flagged by the gateway</Badge>}
        <span className="a-detailValue" style={{ marginLeft: "auto", fontWeight: 600 }}>
          {formatBDT(order.totalAmount)}
        </span>
      </div>

      <section className="a-detailBlock">
        <h3 className="a-detailHead">Customer</h3>
        <DetailRow label="Name">{order.customerName}</DetailRow>
        <DetailRow label="Email">
          <a href={`mailto:${order.email}`}>{order.email}</a>
        </DetailRow>
        <DetailRow label="Phone">
          {order.phone ? <a href={`tel:${order.phone}`}>{order.phone}</a> : "—"}
        </DetailRow>
        <DetailRow label="Deliver to">{order.address || "—"}</DetailRow>
      </section>

      <section className="a-detailBlock">
        <h3 className="a-detailHead">
          {order.items.length === 1 ? "The piece" : `${order.items.length} pieces`}
        </h3>

        <div className="a-tableWrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Work</th>
                <th>Artist</th>
                <th style={{ textAlign: "right" }}>Sold for</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const work = artworks.get(item.artworkId);
                const artist = work ? artists.get(work.artistId) : null;
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="a-rowMain">
                        {work?.photos[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={work.photos[0]} alt="" className="a-thumb" />
                        ) : (
                          <span className="a-thumbFallback">
                            {(work?.title ?? "??").slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div style={{ minWidth: 0 }}>
                          {work ? (
                            <Link href={`/admin/artworks/${work.id}`} className="a-rowTitle">
                              {work.title}
                            </Link>
                          ) : (
                            /* Only reachable in the preview store; in Postgres
                               order_items.artwork_id is ON DELETE RESTRICT. */
                            <span className="a-rowTitle">Removed from the catalogue</span>
                          )}
                          <div className="a-rowSub">{item.artworkId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="a-rowSub">{artist?.name ?? "—"}</td>
                    <td className="a-num" style={{ textAlign: "right" }}>
                      {formatBDT(item.priceAtPurchase)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sold-for is a snapshot: the catalogue price can move afterwards and
            the receipt must not move with it. Worth flagging when they differ. */}
        {order.items.some((i) => {
          const w = artworks.get(i.artworkId);
          return w && w.price !== i.priceAtPurchase;
        }) && (
          <p className="a-hint" style={{ marginTop: 10 }}>
            One or more prices have changed in the catalogue since this order. The amounts above
            are what the customer actually paid.
          </p>
        )}
      </section>

      <section className="a-detailBlock">
        <h3 className="a-detailHead">Payment</h3>
        <DetailRow label="Method">
          {method.label}
          {method.issuer && <span className="a-rowSub"> · {method.issuer}</span>}
        </DetailRow>
        <DetailRow label="Gateway">SSLCommerz</DetailRow>
        <DetailRow label="Confirmed by">
          {order.settledBy ? (
            SETTLED_BY_LABEL[order.settledBy]
          ) : (
            <span style={{ color: "var(--a-muted)" }}>Not recorded</span>
          )}
        </DetailRow>
        <DetailRow label="Transaction ID" mono>
          <Ref value={order.tranId ?? ""} />
        </DetailRow>

        {g ? (
          <>
            <DetailRow label="Bank transaction" mono>
              <Ref value={g.bankTranId} />
            </DetailRow>
            <DetailRow label="Validation ID" mono>
              <Ref value={g.valId} />
            </DetailRow>
            <DetailRow label="Charged" mono>
              {g.currency} {order.totalAmount.toLocaleString("en-US")}
            </DetailRow>
            <DetailRow label="Net to gallery" mono>
              {g.storeAmount > 0 ? (
                <>
                  {g.currency} {g.storeAmount.toLocaleString("en-US")}
                  <span className="a-rowSub">
                    {" "}
                    · {formatBDT(order.totalAmount - g.storeAmount)} gateway fee
                  </span>
                </>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="Paid at">
              {g.paidAt ? formatDateTime(g.paidAt) : "Never completed"}
            </DetailRow>
            <DetailRow label="Risk">
              {g.riskLevel === "0" ? "Clean" : "Flagged for manual review"}
            </DetailRow>
          </>
        ) : (
          <p className="a-hint" style={{ marginTop: 8 }}>
            The customer left the gateway before paying, so SSLCommerz sent nothing back. The
            order is kept so the basket can be recovered or chased up.
          </p>
        )}
      </section>

      <section className="a-detailBlock">
        <h3 className="a-detailHead">History</h3>
        <DetailRow label="Placed">{formatDateTime(order.createdAt)}</DetailRow>
        <DetailRow label="Last change">{formatDateTime(order.updatedAt)}</DetailRow>
      </section>
    </Modal>
  );
}
