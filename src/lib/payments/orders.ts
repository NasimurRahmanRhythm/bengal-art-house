import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Read helpers for orders. The customer-facing ones go through the user's
// session client, never the service-role one — so ownership is enforced by the
// "read own" RLS policies rather than by a WHERE clause somebody could forget
// to write. The single admin-facing reader at the bottom is the exception, and
// carries its own warning.

export type OrderLine = {
  id: string;
  title: string;
  artist: string;
  price: number;
  photoUrl: string | null;
  medium: string | null;
  year: string | null;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  paidAt: string | null;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  fulfillmentStatus: "pending" | "shipped" | "completed";
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
  items: OrderLine[];
};

const ORDER_COLUMNS = `
  id, order_number, created_at, paid_at, payment_status, fulfillment_status,
  customer_name, email, phone, address, city, postcode, country,
  total_amount, currency, tran_id, bank_tran_id, val_id, card_type, card_issuer,
  order_items (
    id, price_at_purchase, title_at_purchase, artist_at_purchase,
    artworks ( title, photo_url, medium, year, artists ( name ) )
  )
`;

/** PostgREST types an embedded to-one relation as an array even though a
    single row comes back. Both shapes are unwrapped rather than cast away. */
function one<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

type RawItem = {
  id: string;
  price_at_purchase: number | string;
  title_at_purchase: string | null;
  artist_at_purchase: string | null;
  artworks: unknown;
};

type RawOrder = Record<string, unknown> & { order_items?: RawItem[] | null };

function shape(row: RawOrder): CustomerOrder {
  const items = (row.order_items ?? []).map((item): OrderLine => {
    const work = one(item.artworks as Record<string, unknown> | Record<string, unknown>[] | null);
    const artist = work
      ? one(work.artists as { name?: string } | { name?: string }[] | null)
      : null;

    return {
      id: item.id,
      // The snapshot wins over the live catalogue: an invoice has to say what
      // was bought, not what the piece is called today.
      title: item.title_at_purchase || (work?.title as string) || "Untitled work",
      artist: item.artist_at_purchase || artist?.name || "",
      price: Number(item.price_at_purchase),
      photoUrl: (work?.photo_url as string) ?? null,
      medium: (work?.medium as string) ?? null,
      year: (work?.year as string) ?? null,
    };
  });

  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    createdAt: row.created_at as string,
    paidAt: (row.paid_at as string) ?? null,
    paymentStatus: row.payment_status as CustomerOrder["paymentStatus"],
    fulfillmentStatus: row.fulfillment_status as CustomerOrder["fulfillmentStatus"],
    customerName: (row.customer_name as string) ?? "",
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? null,
    address: (row.address as string) ?? null,
    city: (row.city as string) ?? null,
    postcode: (row.postcode as string) ?? null,
    country: (row.country as string) ?? null,
    totalAmount: Number(row.total_amount ?? 0),
    currency: (row.currency as string) ?? "BDT",
    tranId: (row.tran_id as string) ?? null,
    bankTranId: (row.bank_tran_id as string) ?? null,
    valId: (row.val_id as string) ?? null,
    cardType: (row.card_type as string) ?? null,
    cardIssuer: (row.card_issuer as string) ?? null,
    items,
  };
}

export async function listMyOrders(): Promise<CustomerOrder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders] could not list orders", error);
    return [];
  }

  return (data ?? []).map((row) => shape(row as RawOrder));
}

export async function getMyOrder(orderNumber: string): Promise<CustomerOrder | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    console.error("[orders] could not read order", error);
    return null;
  }

  return data ? shape(data as RawOrder) : null;
}

/**
 * Reads any order, regardless of who it belongs to.
 *
 * ⚠️ This one bypasses Row Level Security, so it carries no authorisation of
 * its own. Every caller MUST have established that the request comes from an
 * admin first — `checkAdmin()` from `@/lib/admin/auth` — before calling it.
 * Reaching for this from anywhere a customer can hit is an order-number
 * enumeration hole: the numbers are sequential.
 *
 * It exists because an admin legitimately needs to print a customer's invoice,
 * and the session-scoped readers above would return nothing for someone
 * else's order — which is exactly what they are supposed to do.
 */
export async function getOrderAsAdmin(orderNumber: string): Promise<CustomerOrder | null> {
  const db = createAdminClient();

  const { data, error } = await db
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    console.error("[orders] admin could not read order", error);
    return null;
  }

  return data ? shape(data as RawOrder) : null;
}

// Presentation labels shared by the account pages, so the wording of a status
// only ever exists in one place.
export const PAYMENT_LABEL: Record<CustomerOrder["paymentStatus"], string> = {
  paid: "Paid",
  pending: "Awaiting payment",
  failed: "Payment failed",
  cancelled: "Cancelled",
};

export const FULFILLMENT_LABEL: Record<CustomerOrder["fulfillmentStatus"], string> = {
  pending: "Preparing",
  shipped: "On its way",
  completed: "Delivered",
};
