import { NextResponse } from "next/server";
import { readCallback, settlePayment } from "@/lib/payments/settle";
import { siteUrl } from "@/lib/payments/sslcommerz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SSLCommerz returns the customer here with a POST, so this leg has to answer
// a 303 — the browser must be told to follow up with a GET, otherwise it
// re-POSTs to the confirmation page and Next answers 405.
//
// GET is exported too because the customer may reload the tab afterwards, and
// some issuer apps re-open the return URL without the body.

async function handle(request: Request) {
  const fields = await readCallback(request);
  const result = await settlePayment(fields);

  if (result.reason) {
    console.error(`[sslcommerz:success] ${result.outcome} — ${result.reason}`);
  }

  const status = result.outcome === "already-paid" ? "paid" : result.outcome;
  const url = new URL("/checkout/result", siteUrl());
  url.searchParams.set("status", status === "paid" ? "success" : status);
  if (result.orderNumber) url.searchParams.set("order", result.orderNumber);

  return NextResponse.redirect(url, 303);
}

export const POST = handle;
export const GET = handle;
