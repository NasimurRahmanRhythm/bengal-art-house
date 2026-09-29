import { PdfDoc, textWidth, wrap } from "./pdf";
import { SITE } from "@/data/site";
import type { CustomerOrder } from "./orders";

// The layout of the gallery's invoice. Kept apart from the PDF primitives so
// that changing what the document says never means touching the file format.

export type InvoiceItem = {
  title: string;
  artist: string;
  price: number;
};

export type InvoiceOrder = {
  orderNumber: string;
  createdAt: string;
  paidAt: string | null;
  paymentStatus: string;
  customerName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  totalAmount: number;
  currency: string;
  tranId: string | null;
  bankTranId: string | null;
  valId: string | null;
  cardType: string | null;
  cardIssuer: string | null;
  items: InvoiceItem[];
};

const MARGIN = 52;
const RIGHT = 595.28 - MARGIN;

const money = (amount: number, currency = "BDT") =>
  `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });

const stamp = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });

const STATUS_LABEL: Record<string, string> = {
  paid: "PAID",
  pending: "AWAITING PAYMENT",
  failed: "PAYMENT FAILED",
  cancelled: "CANCELLED",
};

/** Narrows an order row down to just what the invoice prints.
 *
 *  Shared by the customer's download and the admin's, so the two can never
 *  drift into printing different documents for the same order — which, for a
 *  financial record, is the one difference that would actually matter. */
export function invoiceFromOrder(order: CustomerOrder): InvoiceOrder {
  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    paymentStatus: order.paymentStatus,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    postcode: order.postcode,
    country: order.country,
    totalAmount: order.totalAmount,
    currency: order.currency,
    tranId: order.tranId,
    bankTranId: order.bankTranId,
    valId: order.valId,
    cardType: order.cardType,
    cardIssuer: order.cardIssuer,
    items: order.items.map((i) => ({ title: i.title, artist: i.artist, price: i.price })),
  };
}

/** Renders a paid (or unpaid — the status is printed either way) invoice and
    returns the finished PDF bytes. */
export function renderInvoice(order: InvoiceOrder): Buffer {
  const doc = new PdfDoc();
  const H = doc.height;

  // y is measured from the top all the way down this function, and converted
  // at each draw call. Trying to think in PDF's bottom-up coordinates while
  // laying out a document that reads top-down is how columns end up inverted.
  let y = MARGIN;

  const at = (top: number) => H - top;

  // ---- masthead ------------------------------------------------------------
  doc.text(SITE.name, MARGIN, at(y + 12), { size: 19, font: "bold" });
  y += 26;
  doc.text(SITE.tagline, MARGIN, at(y + 8), { size: 8.5, gray: 0.42 });
  y += 14;
  doc.text(SITE.address, MARGIN, at(y + 8), { size: 8.5, gray: 0.42 });
  y += 12;
  doc.text(`${SITE.email}  ·  ${SITE.phone}`.replace("·", "|"), MARGIN, at(y + 8), {
    size: 8.5,
    gray: 0.42,
  });

  // The word INVOICE and its number sit on the masthead's own baseline, right
  // aligned — so the eye finds the reference before it reads anything else.
  doc.textRight("INVOICE", RIGHT, at(MARGIN + 12), { size: 19, font: "bold", gray: 0.15 });
  doc.textRight(order.orderNumber, RIGHT, at(MARGIN + 30), { size: 10.5, font: "bold" });
  doc.textRight(longDate(order.createdAt), RIGHT, at(MARGIN + 44), { size: 8.5, gray: 0.42 });

  const statusText = STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus.toUpperCase();
  const statusWidth = textWidth(statusText, 8.5, "bold");
  doc.rect(RIGHT - statusWidth - 12, at(MARGIN + 66), statusWidth + 12, 15, 0.9);
  doc.textRight(statusText, RIGHT - 6, at(MARGIN + 62), { size: 8.5, font: "bold", gray: 0.1 });

  y = MARGIN + 92;
  doc.line(MARGIN, at(y), RIGHT, at(y), 0.75, 1);
  y += 26;

  // ---- billed to -----------------------------------------------------------
  doc.text("BILLED TO", MARGIN, at(y), { size: 7.5, font: "bold", gray: 0.5 });
  doc.text("PAYMENT", MARGIN + 300, at(y), { size: 7.5, font: "bold", gray: 0.5 });
  y += 16;

  const left: string[] = [order.customerName, order.email];
  if (order.phone) left.push(order.phone);

  const place = [order.address, order.city, order.postcode].filter(Boolean).join(", ");
  if (place) left.push(place);
  if (order.country) left.push(order.country);

  const right: [string, string][] = [
    ["Method", methodLabel(order)],
    ["Gateway", "SSLCommerz"],
    ["Transaction", order.tranId ?? "-"],
  ];
  if (order.bankTranId) right.push(["Bank ref", order.bankTranId]);
  if (order.paidAt && order.paymentStatus === "paid") right.push(["Paid on", stamp(order.paidAt)]);

  const rows = Math.max(left.length, right.length);
  for (let i = 0; i < rows; i++) {
    if (left[i]) {
      doc.text(left[i], MARGIN, at(y), { size: 9.5, font: i === 0 ? "bold" : "regular" });
    }
    if (right[i]) {
      doc.text(right[i][0], MARGIN + 300, at(y), { size: 9, gray: 0.45 });
      doc.text(right[i][1], MARGIN + 360, at(y), { size: 9 });
    }
    y += 14;
  }

  y += 18;

  // ---- the works -----------------------------------------------------------
  doc.line(MARGIN, at(y), RIGHT, at(y), 0.85);
  y += 14;
  doc.text("WORK", MARGIN, at(y), { size: 7.5, font: "bold", gray: 0.5 });
  doc.text("ARTIST", MARGIN + 270, at(y), { size: 7.5, font: "bold", gray: 0.5 });
  doc.textRight("AMOUNT", RIGHT, at(y), { size: 7.5, font: "bold", gray: 0.5 });
  y += 8;
  doc.line(MARGIN, at(y), RIGHT, at(y), 0.85);
  y += 18;

  for (const item of order.items) {
    // 258pt of title column before the artist starts at +270 — long
    // catalogue titles wrap rather than run under the next column.
    const lines = wrap(item.title, 10, 250);

    lines.forEach((line, i) => {
      doc.text(line, MARGIN, at(y + i * 13), { size: 10 });
    });
    doc.text(item.artist || "-", MARGIN + 270, at(y), { size: 9.5, gray: 0.35 });
    doc.textRight(money(item.price, order.currency), RIGHT, at(y), { size: 10 });

    y += lines.length * 13 + 9;
    doc.line(MARGIN, at(y - 4), RIGHT, at(y - 4), 0.92, 0.4);

    // One page is plenty for a realistic basket, but a 30-piece order should
    // spill rather than overprint the footer.
    if (y > H - 190) {
      doc.endPage();
      y = MARGIN;
    }
  }

  y += 8;

  // ---- total ---------------------------------------------------------------
  doc.textRight("TOTAL PAID", RIGHT - 150, at(y + 4), { size: 9, font: "bold", gray: 0.45 });
  doc.textRight(money(order.totalAmount, order.currency), RIGHT, at(y), {
    size: 14,
    font: "bold",
  });
  y += 12;
  doc.line(RIGHT - 150, at(y), RIGHT, at(y), 0.3, 1);

  y += 34;
  doc.text(
    order.paymentStatus === "paid"
      ? "Payment received in full. Thank you."
      : "This invoice is not yet settled.",
    MARGIN,
    at(y),
    { size: 9.5, gray: 0.3 },
  );
  y += 14;
  doc.text(
    "Every acquisition is backed by the gallery's provenance and authentication service.",
    MARGIN,
    at(y),
    { size: 8.5, gray: 0.5 },
  );
  y += 12;
  doc.text(
    "The gallery will be in touch about delivery or collection of the work.",
    MARGIN,
    at(y),
    { size: 8.5, gray: 0.5 },
  );

  // ---- footer, pinned to the bottom ---------------------------------------
  doc.line(MARGIN, at(H - 62), RIGHT, at(H - 62), 0.88);
  doc.text(
    `${SITE.name} — ${SITE.address}`,
    MARGIN,
    at(H - 48),
    { size: 8, gray: 0.5 },
  );
  doc.textRight(
    order.valId ? `Validation ID ${order.valId}` : "Computer-generated invoice",
    RIGHT,
    at(H - 48),
    { size: 8, gray: 0.5 },
  );

  return doc.build();
}

/** SSLCommerz reports the instrument as one hyphenated string, e.g.
    "BKASH-bKash" or "VISA-Dutch Bangla Bank". The invoice wants it readable. */
function methodLabel(order: InvoiceOrder): string {
  if (!order.cardType) return order.paymentStatus === "paid" ? "Online payment" : "Not taken";
  const [scheme, ...rest] = order.cardType.split("-");
  const issuer = order.cardIssuer || rest.join("-");
  const brand = scheme.trim();
  return issuer ? `${brand} (${issuer.trim()})` : brand;
}
