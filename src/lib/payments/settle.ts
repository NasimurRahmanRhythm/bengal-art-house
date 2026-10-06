import { createAdminClient } from "@/lib/supabase/admin";
import { isPaidStatus, validateTransaction, verifySignature } from "./sslcommerz";

// Everything that decides what a gateway callback means to an order lives
// here, so the four callback routes (success, fail, cancel, ipn) stay
// three lines each and cannot drift apart in what they accept as payment.

export type Settlement = {
  outcome: "paid" | "failed" | "cancelled" | "unknown" | "already-paid";
  orderNumber: string | null;
  reason?: string;
};

/** Which route is asking — recorded on the order as `settled_by`.
 *
 *  The success redirect and the IPN send an identical body, so without this
 *  the database cannot say which of them confirmed a payment, and the IPN
 *  becomes untestable: it can be completely broken while every order still
 *  looks fine. That is not a theoretical worry here — a bKash customer on a
 *  phone usually never returns to the browser, so the IPN is the only leg
 *  that fires, and a silent failure means money taken against an order stuck
 *  at 'pending'.
 *
 *  `checkout` is the odd one out: it means the order never reached the
 *  gateway at all, because SSLCommerz refused to open a session. */
export type SettleSource = "checkout" | "success" | "fail" | "cancel" | "ipn";

/** Reads a callback body regardless of how SSLCommerz encoded it. The gateway
    sends form-encoded POSTs, but the IPN can be configured to send JSON, and
    the cancel leg has been observed arriving as a bare GET with query
    parameters. All three end up as a flat string map. */
export async function readCallback(request: Request): Promise<Record<string, string>> {
  const fields: Record<string, string> = {};

  for (const [k, v] of new URL(request.url).searchParams) fields[k] = v;

  if (request.method !== "POST") return fields;

  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(body)) fields[k] = v == null ? "" : String(v);
    } else {
      const form = await request.formData();
      for (const [k, v] of form) fields[k] = typeof v === "string" ? v : "";
    }
  } catch {
    // A body we cannot parse is treated as no body — the tran_id check below
    // then rejects it, which is the right answer either way.
  }

  return fields;
}

/** Confirms a payment and, only if SSLCommerz's own validator agrees, moves
 *  the order to `paid`.
 *
 *  Called from both the success redirect and the IPN, which race each other.
 *  Whichever arrives first does the work and stamps `settled_by` with its own
 *  name; the second sees payment_status already 'paid' and returns
 *  'already-paid' without touching anything. So the stamp always names the
 *  leg that actually confirmed the money. */
export async function settlePayment(
  fields: Record<string, string>,
  source: SettleSource,
): Promise<Settlement> {
  const tranId = fields.tran_id?.trim();
  if (!tranId) return { outcome: "unknown", orderNumber: null, reason: "no tran_id in callback" };

  const db = createAdminClient();

  const { data: order } = await db
    .from("orders")
    .select("id, order_number, total_amount, currency, payment_status")
    .eq("tran_id", tranId)
    .maybeSingle();

  if (!order) {
    return { outcome: "unknown", orderNumber: null, reason: `no order for tran_id ${tranId}` };
  }

  // A refunded order is finished too. Without this a late or replayed
  // callback would sail through validation (SSLCommerz still says VALIDATED),
  // fail to update the row, and then mark the works sold again — undoing an
  // admin's choice to put them back on sale.
  if (order.payment_status === "paid" || order.payment_status === "refunded") {
    return { outcome: "already-paid", orderNumber: order.order_number };
  }

  // Signature failure is logged rather than fatal: it is the store password
  // being out of step far more often than it is an attack, and the validator
  // call below is what actually authorises the money either way.
  if (fields.verify_sign && !verifySignature(fields)) {
    console.error(`[sslcommerz] verify_sign did not match for ${tranId}`);
  }

  const valId = fields.val_id?.trim();
  if (!valId) {
    await markUnpaid(tranId, "failed", source);
    return {
      outcome: "failed",
      orderNumber: order.order_number,
      reason: "callback carried no val_id",
    };
  }

  const validation = await validateTransaction(valId);

  if (!validation || !isPaidStatus(validation.status)) {
    // A validator that cannot be reached is deliberately NOT recorded as a
    // failure — the order stays 'pending' so the IPN can settle it later,
    // rather than a network blip losing a payment the customer really made.
    if (!validation) {
      return {
        outcome: "unknown",
        orderNumber: order.order_number,
        reason: "validator unreachable; order left pending",
      };
    }
    await markUnpaid(tranId, "failed", source, validation);
    return {
      outcome: "failed",
      orderNumber: order.order_number,
      reason: `validator returned ${validation.status ?? "no status"}`,
    };
  }

  // The three things a forged or replayed callback would get wrong.
  const paidAmount = Number(validation.amount ?? 0);
  const expected = Number(order.total_amount);

  if (validation.tran_id && validation.tran_id !== tranId) {
    return {
      outcome: "unknown",
      orderNumber: order.order_number,
      reason: "validator returned a different tran_id",
    };
  }
  if ((validation.currency ?? "BDT") !== order.currency) {
    await markUnpaid(tranId, "failed", source, validation);
    return {
      outcome: "failed",
      orderNumber: order.order_number,
      reason: `paid in ${validation.currency}, expected ${order.currency}`,
    };
  }
  // Tolerance of one poisha absorbs float formatting, nothing more — an
  // underpayment of any real size is a failed order, not a discount.
  if (paidAmount + 0.01 < expected) {
    await markUnpaid(tranId, "failed", source, validation);
    return {
      outcome: "failed",
      orderNumber: order.order_number,
      reason: `paid ${paidAmount}, expected ${expected}`,
    };
  }

  const { error: updateError } = await db
    .from("orders")
    .update({
      payment_status: "paid",
      val_id: valId,
      bank_tran_id: validation.bank_tran_id ?? null,
      card_type: validation.card_type ?? null,
      card_issuer: validation.card_issuer ?? null,
      store_amount: validation.store_amount ? Number(validation.store_amount) : null,
      risk_level: validation.risk_level ?? null,
      risk_title: validation.risk_title ?? null,
      paid_at: parseTranDate(validation.tran_date),
      settled_by: source,
      sslcommerz_response: { callback: fields, validation },
    })
    .eq("id", order.id)
    .eq("payment_status", "pending"); // loses the race harmlessly rather than double-writing

  if (updateError) {
    console.error("[sslcommerz] could not mark order paid", updateError);
    return {
      outcome: "unknown",
      orderNumber: order.order_number,
      reason: updateError.message,
    };
  }

  await markItemsSold(order.id);

  return { outcome: "paid", orderNumber: order.order_number };
}

/** Records a payment that did not happen. Never downgrades an order that is
    already paid — the fail and cancel legs can arrive after a successful
    retry on the same tran_id. */
export async function markUnpaid(
  tranId: string,
  status: "failed" | "cancelled",
  source: SettleSource,
  extra?: unknown,
): Promise<string | null> {
  const db = createAdminClient();

  const { data } = await db
    .from("orders")
    .update({
      payment_status: status,
      settled_by: source,
      ...(extra ? { sslcommerz_response: extra } : {}),
    })
    .eq("tran_id", tranId)
    .eq("payment_status", "pending")
    .select("order_number")
    .maybeSingle();

  if (data) return data.order_number;

  // Nothing was updated: either the tran_id is unknown or the order had
  // already moved on. Read the number back so the customer still lands on a
  // page that names their order.
  const { data: existing } = await db
    .from("orders")
    .select("order_number")
    .eq("tran_id", tranId)
    .maybeSingle();

  return existing?.order_number ?? null;
}

/** Takes the pieces off the market. Sculpture is sold as unique works, so a
    paid order retires every line in it — there is no stock count to decrement. */
async function markItemsSold(orderId: string): Promise<void> {
  const db = createAdminClient();

  const { data: items } = await db
    .from("order_items")
    .select("artwork_id")
    .eq("order_id", orderId);

  const ids = (items ?? []).map((i) => i.artwork_id).filter(Boolean);
  if (ids.length === 0) return;

  const { error } = await db.from("artworks").update({ status: "sold" }).in("id", ids);

  // Deliberately not fatal: the money is already taken and the order is paid.
  // A piece left showing as available is a catalogue problem for the admin to
  // fix, not a reason to fail the customer's confirmation page.
  if (error) console.error("[sslcommerz] could not mark artworks sold", error);
}

/** SSLCommerz sends "2026-08-26 14:55:31" in Asia/Dhaka with no zone marker.
    Read as UTC it would land six hours early, so the offset is stated. */
function parseTranDate(raw: string | undefined): string {
  if (!raw) return new Date().toISOString();
  const parsed = new Date(raw.replace(" ", "T") + "+06:00");
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}
