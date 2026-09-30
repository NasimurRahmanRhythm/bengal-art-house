// These mirror the Postgres columns in supabase/migrations one-for-one, so what
// the dashboard asks for is exactly what the schema stores. If a field feels
// like busywork on screen, that is the signal to drop the column.

export type ArtworkStatus = "available" | "sold" | "reserved";

// The one fixed list on an artwork, and the opposite of `material`: material is
// the gallery's own words, category is what a visitor filters by, so it has to
// mean the same thing on every row. Adding a fifth is a migration.
export const CATEGORIES = ["Calligraphy", "Installation", "Paintings", "Sculpture"] as const;
export type Category = (typeof CATEGORIES)[number];

// A piece can be centuries old, but not older than the gallery could plausibly
// hold, and never dated in the future.
export const YEAR_MAX = new Date().getFullYear();
export const YEAR_MIN = YEAR_MAX - 300;
export type EnquiryStatus = "new" | "read";
export type PaymentStatus = "pending" | "paid" | "failed";
export type FulfillmentStatus = "pending" | "shipped" | "completed";

export type Fact = { label: string; value: string };

// Name, picture, biography — the three things the gallery said it would collect
// for an artist. Role, one-line summary and key facts were dropped: the public
// pages that used them now take the first line of the biography instead.
export type Artist = {
  id: string;
  slug: string;
  name: string;
  bio: string[];
  photos: string[];
  initials: string;
  plate: number;
};

// Name, description, pictures, price, material. Year, dimensions and the fixed
// four-value material family were dropped on purpose — the gallery asked for a
// form an unhurried 70-year-old can fill in, and every extra box was one more
// thing to explain. Artist and status stay because they are one click each and
// the site cannot attribute or sell a piece without them.
export type Artwork = {
  id: string;
  slug: string;
  artistId: string;
  title: string;
  description: string;
  // Free text, in the gallery's own words: "Bronze on granite base".
  material: string;
  category: Category | "";
  year: string;
  dimensions: string;
  price: number;
  status: ArtworkStatus;
  photos: string[];
  plate: number;
};

export type Exhibition = {
  id: string;
  slug: string;
  title: string;
  venue: string;
  dateStart: string | null; // ISO yyyy-mm-dd
  dateEnd: string | null;
  dateLabel: string;
  year: string;
  // Both free text: entry is "Free" as often as it is a number, and the hours
  // are read by a person rather than parsed.
  ticketInfo: string;
  openingHours: string;
  blurb: string;
  photos: string[];
  plate: number;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  artworkId: string | null;
  status: EnquiryStatus;
  createdAt: string;
};

// orders ---------------------------------------------------------------------
// One row per artwork in the basket. The title is not stored here: order_items
// keeps only artwork_id (with ON DELETE RESTRICT, so the piece can never
// vanish out from under an order) and the price it sold for, which is what
// makes a receipt reproducible after the catalogue price changes.
export type OrderItem = {
  id: string;
  artworkId: string;
  priceAtPurchase: number;
};

// The slice of the SSLCommerz IPN payload worth putting on screen. The full
// body stays in orders.sslcommerz_response for dispute evidence; these are the
// fields an admin actually reads when a customer asks whether a payment went
// through, and which instrument they used.
export type GatewayReceipt = {
  cardType: string; // "VISA-Dutch Bangla Bank", "BKASH-bKash", …
  cardIssuer: string;
  bankTranId: string;
  valId: string;
  currency: string;
  storeAmount: number; // what reaches the gallery account after gateway fees
  riskLevel: string; // "0" clean, "1" flagged for manual review
  paidAt: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  tranId: string | null;
  gateway: GatewayReceipt | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

// blog -----------------------------------------------------------------------
// `html` is what the editor produced. It is stored as markup rather than a
// portable document model because there is exactly one editor and one renderer;
// a JSON tree would buy portability nobody has asked for.
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  html: string;
  tag: string;
  authorName: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// media & press release ------------------------------------------------------
// Same shape as BlogPost — a separate table rather than a shared one with a
// "kind" column, because coverage of the gallery (press) and writing by the
// gallery (blog) are different content types that will want different fields
// the moment either one grows (a source publication, an embargo date).
export type PressRelease = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  html: string;
  // Which paper or channel ran it — the one field press has that blog does not.
  publication: string;
  tag: string;
  authorName: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// The people who run the gallery, as opposed to the people whose work it shows.
// No slug and no page of their own: they appear as a list and nowhere else.
export type GoverningMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photos: string[];
  orderIndex: number;
};

export type AdminData = {
  artists: Artist[];
  artworks: Artwork[];
  exhibitions: Exhibition[];
  governingBody: GoverningMember[];
  enquiries: Enquiry[];
  orders: Order[];
  posts: BlogPost[];
  pressReleases: PressRelease[];
};

// Dates are the one place the schema can't be fully derived: some exhibitions
// are known only by year. A null dateStart means "archive, sort by year".
export function exhibitionPhase(e: Exhibition): "current" | "upcoming" | "past" {
  if (!e.dateStart) return "past";
  const today = new Date().toISOString().slice(0, 10);
  const end = e.dateEnd ?? e.dateStart;
  if (end < today) return "past";
  if (e.dateStart > today) return "upcoming";
  return "current";
}

// SSLCommerz reports the instrument as one hyphenated string —
// "BKASH-bKash", "VISA-Dutch Bangla Bank". The list column wants the brand as
// people write it, so the known schemes are spelled out and anything new falls
// back to title case rather than shouting.
const SCHEME_LABEL: Record<string, string> = {
  BKASH: "bKash",
  NAGAD: "Nagad",
  ROCKET: "Rocket",
  UPAY: "Upay",
  VISA: "Visa",
  MASTER: "Mastercard",
  MASTERCARD: "Mastercard",
  AMEX: "Amex",
  DBBLNEXUS: "Nexus",
  QCASH: "Q-Cash",
  CITYTOUCH: "City Touch",
  IBBL: "IBBL",
  BANKASIA: "Bank Asia",
};

export function paymentMethod(order: Order): { label: string; issuer: string } {
  const raw = order.gateway?.cardType;
  if (!raw) {
    return {
      label: order.paymentStatus === "failed" ? "Not taken" : "Awaiting payment",
      issuer: "",
    };
  }
  const [scheme, ...rest] = raw.split("-");
  const key = scheme.trim().toUpperCase();
  const label = SCHEME_LABEL[key] ?? key.charAt(0) + key.slice(1).toLowerCase();

  // Wallets come back with the brand repeated on both sides — "BKASH-BKash",
  // "NAGAD-Nagad" — so echoing the suffix renders "bKash · bKash", which
  // reads like a fault. Cards put the actual bank there instead
  // ("VISA-Dutch Bangla"), and that is the half worth showing.
  const issuer = rest.join("-").trim();
  return { label, issuer: issuer.toUpperCase() === key ? "" : issuer };
}
