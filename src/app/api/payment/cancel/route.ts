import { NextResponse } from "next/server";
import { markUnpaid, readCallback } from "@/lib/payments/settle";
import { siteUrl } from "@/lib/payments/sslcommerz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The customer pressed cancel on the gateway page. Distinct from 'failed' on
// purpose: nothing went wrong, so the basket is left intact and the
// confirmation page invites them to pick up where they left off.

async function handle(request: Request) {
  const fields = await readCallback(request);
  const tranId = fields.tran_id?.trim();

  const orderNumber = tranId
    ? await markUnpaid(tranId, "cancelled", "cancel", { callback: fields })
    : null;

  const url = new URL("/checkout/result", siteUrl());
  url.searchParams.set("status", "cancelled");
  if (orderNumber) url.searchParams.set("order", orderNumber);

  return NextResponse.redirect(url, 303);
}

export const POST = handle;
export const GET = handle;
