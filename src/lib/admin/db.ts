import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AdminData,
  Artist,
  Artwork,
  BlogPost,
  Enquiry,
  Exhibition,
  GoverningMember,
  Order,
  PressRelease,
} from "./types";

// The one place that knows both shapes: snake_case Postgres columns on one
// side, the camelCase types the screens use on the other. Everything below runs
// with the service_role key, which bypasses RLS — see the note in actions.ts
// for why that is the write path while the admin panel has no login of its own.

/** False when the project has no Supabase credentials — a local checkout with
    no .env.local, or a deploy that has not had them added yet. */
export function dbConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

type Row = Record<string, unknown>;

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
const num = (v: unknown): number => (v == null ? 0 : Number(v));

export function rowToArtist(r: Row): Artist {
  return {
    id: str(r.id),
    slug: str(r.slug),
    name: str(r.name),
    bio: strs(r.bio),
    photos: strs(r.photos),
    initials: str(r.initials),
    plate: num(r.plate),
  };
}

export function rowToArtwork(r: Row): Artwork {
  return {
    id: str(r.id),
    slug: str(r.slug),
    artistId: str(r.artist_id),
    title: str(r.title),
    description: str(r.description),
    material: str(r.material),
    category: str(r.category) as Artwork["category"],
    year: str(r.year),
    dimensions: str(r.dimensions),
    price: num(r.price),
    status: (str(r.status) || "available") as Artwork["status"],
    photos: strs(r.photos),
    plate: num(r.plate),
  };
}

export function rowToExhibition(r: Row): Exhibition {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: str(r.title),
    venue: str(r.venue),
    dateStart: (r.date_start as string) ?? null,
    dateEnd: (r.date_end as string) ?? null,
    dateLabel: str(r.date_label),
    year: str(r.year),
    ticketInfo: str(r.ticket_info),
    openingHours: str(r.opening_hours),
    blurb: str(r.blurb),
    photos: strs(r.photos),
    plate: num(r.plate),
  };
}

export function rowToMember(r: Row): GoverningMember {
  return {
    id: str(r.id),
    name: str(r.name),
    role: str(r.role),
    bio: str(r.bio),
    // One column in the database, a list on screen: the upload control is the
    // same one every other record uses, and only the first picture is shown.
    photos: str(r.photo_url) ? [str(r.photo_url)] : [],
    orderIndex: num(r.order_index),
  };
}

function rowToWriting(r: Row) {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: str(r.title),
    excerpt: str(r.excerpt),
    coverUrl: (r.cover_url as string) ?? null,
    html: str(r.body_html),
    tag: str(r.tag),
    authorName: str(r.author_name),
    published: Boolean(r.published),
    publishedAt: (r.published_at as string) ?? null,
    createdAt: str(r.created_at),
    updatedAt: str(r.updated_at),
  };
}

export const rowToPost = (r: Row): BlogPost => rowToWriting(r);

export const rowToRelease = (r: Row): PressRelease => ({
  ...rowToWriting(r),
  publication: str(r.publication),
});

export function rowToEnquiry(r: Row): Enquiry {
  return {
    id: str(r.id),
    name: str(r.name),
    email: str(r.email),
    phone: str(r.phone),
    message: str(r.message),
    artworkId: (r.artwork_id as string) ?? null,
    status: (str(r.status) || "new") as Enquiry["status"],
    createdAt: str(r.created_at),
  };
}

function rowToOrder(r: Row): Order {
  return {
    id: str(r.id),
    orderNumber: str(r.order_number),
    customerName: str(r.customer_name),
    email: str(r.email),
    phone: str(r.phone),
    address: str(r.address),
    totalAmount: num(r.total_amount),
    paymentStatus: (str(r.payment_status) || "pending") as Order["paymentStatus"],
    fulfillmentStatus: (str(r.fulfillment_status) || "pending") as Order["fulfillmentStatus"],
    tranId: (r.tran_id as string) ?? null,
    settledBy: (r.settled_by as Order["settledBy"]) ?? null,
    refund: r.refunded_at
      ? {
          amount: num(r.refund_amount),
          reason: str(r.refund_reason),
          ref: str(r.refund_ref),
          at: str(r.refunded_at),
        }
      : null,

    // The receipt is read from the columns, not from sslcommerz_response.
    //
    // The raw gateway body is still kept in that column for dispute evidence,
    // but it is stored as { callback, validation } — two levels deep — so
    // reading card_type off it directly yielded undefined for every order,
    // and the panel showed a paid order as "Awaiting payment" with a blank
    // bank reference. The payments migration promoted these out to real
    // columns precisely so no screen has to parse JSON to render a receipt.
    //
    // Keyed off val_id rather than the blob being non-null: a FAILED order
    // has a stored body too, and treating that as a receipt printed an empty
    // gateway block instead of the "customer left the gateway" note. val_id
    // only exists once SSLCommerz's validator has confirmed the money.
    gateway: r.val_id
      ? {
          cardType: str(r.card_type),
          cardIssuer: str(r.card_issuer),
          bankTranId: str(r.bank_tran_id),
          valId: str(r.val_id),
          currency: str(r.currency) || "BDT",
          storeAmount: num(r.store_amount),
          riskLevel: str(r.risk_level),
          // paid_at is a real timestamptz. tran_date, which this used to read,
          // is the gateway's own "2026-09-30 20:50:44" — Dhaka local time with
          // no zone marker, which Date() would have read six hours early.
          paidAt: (r.paid_at as string) ?? null,
        }
      : null,
    items: Array.isArray(r.order_items)
      ? (r.order_items as Row[]).map((i) => ({
          id: str(i.id),
          artworkId: str(i.artwork_id),
          priceAtPurchase: num(i.price_at_purchase),
        }))
      : [],
    createdAt: str(r.created_at),
    updatedAt: str(r.updated_at),
  };
}

/** Everything the dashboard renders, in one round trip per table. */
export async function fetchAll(): Promise<{ data: AdminData; failed: string[] }> {
  const db = createAdminClient();

  const [artists, artworks, exhibitions, governing, enquiries, orders, posts, press] =
    await Promise.all([
      db.from("artists").select("*").order("name"),
      db.from("artworks").select("*").order("created_at", { ascending: false }),
      db
        .from("exhibitions")
        .select("*")
        .order("date_start", { ascending: false, nullsFirst: false }),
      db.from("governing_body").select("*").order("order_index"),
      db.from("enquiries").select("*").order("created_at", { ascending: false }),
      db.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      db.from("posts").select("*").order("created_at", { ascending: false }),
      db.from("press_releases").select("*").order("created_at", { ascending: false }),
    ]);

  // One failing table must not blank the whole dashboard. The usual cause is a
  // database that has not had the newest migration run yet, and in that case
  // every other screen should still work — so the failures are collected and
  // reported alongside the tables that did load.
  const failed = (
    [
      ["artists", artists],
      ["artworks", artworks],
      ["exhibitions", exhibitions],
      ["governing body", governing],
      ["enquiries", enquiries],
      ["orders", orders],
      ["posts", posts],
      ["press releases", press],
    ] as const
  )
    .filter(([, r]) => r.error)
    .map(([name]) => name);

  return {
    data: {
      artists: (artists.data ?? []).map(rowToArtist),
      artworks: (artworks.data ?? []).map(rowToArtwork),
      exhibitions: (exhibitions.data ?? []).map(rowToExhibition),
      governingBody: (governing.data ?? []).map(rowToMember),
      enquiries: (enquiries.data ?? []).map(rowToEnquiry),
      orders: (orders.data ?? []).map(rowToOrder),
      posts: (posts.data ?? []).map(rowToPost),
      pressReleases: (press.data ?? []).map(rowToRelease),
    },
    failed,
  };
}
