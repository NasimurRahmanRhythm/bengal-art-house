import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initSession, newTranId } from "@/lib/payments/sslcommerz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  items?: unknown;
  name?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  postcode?: unknown;
};

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Opens a payment session.
 *
 *  The browser sends only which pieces are in the basket — slugs, nothing
 *  else. Titles, prices and availability are all read back out of Postgres
 *  here, so a tampered basket can change what is bought but never what it
 *  costs. */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return bad("Malformed request.");
  }

  // ---- who is buying -------------------------------------------------------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return bad("Please sign in before paying.", 401);

  // orders.email is NOT NULL, and SSLCommerz refuses a session without
  // cus_email. Every account on this site is created from an address, so this
  // is a guard against a future passwordless provider rather than a live case.
  if (!user.email) return bad("Your account has no email address on it.", 400);

  const name = str(body.name);
  const phone = str(body.phone);
  const address = str(body.address);
  const city = str(body.city);
  const postcode = str(body.postcode);

  if (!name) return bad("A name is required.");
  if (!phone) return bad("A phone number is required.");

  // Loose on purpose: 01712345678, +8801712345678 and 8801712-345678 are all
  // the same number written how people actually write it. The gateway wants
  // 11 digits, so that is what is checked — not a format.
  if (phone.replace(/\D/g, "").length < 11) {
    return bad("Enter a full phone number, including the leading 0.");
  }

  // ---- what is being bought ------------------------------------------------
  const slugs = Array.isArray(body.items)
    ? [...new Set(body.items.filter((s): s is string => typeof s === "string" && s.length > 0))]
    : [];

  if (slugs.length === 0) return bad("Your selection is empty.");

  const db = createAdminClient();

  const { data: works, error: worksError } = await db
    .from("artworks")
    .select("id, slug, title, price, status, artists ( name )")
    .in("slug", slugs);

  if (worksError) {
    console.error("[checkout] artwork lookup failed", worksError);
    return bad("Could not read the catalogue. Please try again.", 502);
  }

  const found = works ?? [];

  if (found.length !== slugs.length) {
    const missing = slugs.filter((s) => !found.some((w) => w.slug === s));
    // Almost always means the catalogue seed has not been run against this
    // database, so the message says so rather than blaming the customer.
    console.error(`[checkout] artworks not in the database: ${missing.join(", ")}`);
    return bad("Some works in your selection are no longer listed. Please refresh and retry.");
  }

  const unavailable = found.filter((w) => w.status !== "available");
  if (unavailable.length > 0) {
    return bad(
      `${unavailable.map((w) => w.title).join(", ")} ${
        unavailable.length === 1 ? "has" : "have"
      } already been sold. Please remove ${unavailable.length === 1 ? "it" : "them"} and try again.`,
    );
  }

  const total = found.reduce((sum, w) => sum + Number(w.price), 0);
  if (!(total > 0)) return bad("That selection has no price to charge.");

  // ---- the order row -------------------------------------------------------
  const tranId = newTranId();

  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      customer_id: user.id,
      customer_name: name,
      email: user.email,
      phone,
      address,
      city,
      postcode,
      country: "Bangladesh",
      total_amount: total,
      currency: "BDT",
      payment_status: "pending",
      tran_id: tranId,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("[checkout] could not create the order", orderError);
    return bad("Could not start the order. Please try again.", 500);
  }

  const artistNameOf = (w: (typeof found)[number]): string => {
    // PostgREST types an embedded to-one relation as an array; at runtime it
    // is the object. Both shapes are handled rather than cast away.
    const rel = w.artists as unknown as { name?: string } | { name?: string }[] | null;
    if (Array.isArray(rel)) return rel[0]?.name ?? "";
    return rel?.name ?? "";
  };

  const { error: itemsError } = await db.from("order_items").insert(
    found.map((w) => ({
      order_id: order.id,
      artwork_id: w.id,
      price_at_purchase: Number(w.price),
      title_at_purchase: w.title,
      artist_at_purchase: artistNameOf(w),
    })),
  );

  if (itemsError) {
    console.error("[checkout] could not write the order lines", itemsError);
    await db.from("orders").delete().eq("id", order.id);
    return bad("Could not start the order. Please try again.", 500);
  }

  // The name and phone typed at checkout are the customer's real details, so
  // they become the profile — this is the only place the site ever learns them.
  await db
    .from("profiles")
    .update({ full_name: name, phone })
    .eq("id", user.id);

  // ---- hand off to the gateway --------------------------------------------
  const productName =
    found.length === 1 ? found[0].title : `${found.length} works — Gallery Hamiduzzaman`;

  let session;
  try {
    session = await initSession({
      tranId,
      amount: total,
      customerName: name,
      customerEmail: user.email,
      customerPhone: phone,
      address,
      city,
      postcode,
      country: "Bangladesh",
      productName,
      numItems: found.length,
    });
  } catch (err) {
    // sslConfig() throws when a credential is missing. That is a deployment
    // fault, not a customer one, so it is logged in full and reported plainly.
    console.error("[checkout] gateway not configured", err);
    await db.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
    return bad("Card payment is not configured yet. Please contact the gallery.", 500);
  }

  if (!session.ok) {
    console.error(`[checkout] SSLCommerz refused the session: ${session.reason}`);
    await db.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
    return bad("The payment gateway could not start a session. Please try again.", 502);
  }

  await db
    .from("orders")
    .update({ session_key: session.sessionKey })
    .eq("id", order.id);

  return NextResponse.json({
    url: session.gatewayUrl,
    orderNumber: order.order_number,
    tranId,
  });
}
