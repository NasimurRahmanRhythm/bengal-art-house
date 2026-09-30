import { NextResponse } from "next/server";
import { markUnpaid, readCallback } from "@/lib/payments/settle";
import { siteUrl } from "@/lib/payments/sslcommerz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The bank declined, or the customer's card ran out of attempts. No validator
// call is made here: there is nothing to validate, and the order is only moved
// off 'pending' — a payment that later succeeds on a retry of the same
// tran_id is left alone by markUnpaid().

async function handle(request: Request) {
  const fields = await readCallback(request);
  const tranId = fields.tran_id?.trim();

  const orderNumber = tranId
    ? await markUnpaid(tranId, "failed", "fail", { callback: fields })
    : null;

  const url = new URL("/checkout/result", siteUrl());
  url.searchParams.set("status", "failed");
  if (orderNumber) url.searchParams.set("order", orderNumber);

  return NextResponse.redirect(url, 303);
}

export const POST = handle;
export const GET = handle;
