import { NextResponse } from "next/server";
import { markUnpaid, readCallback, settlePayment } from "@/lib/payments/settle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-to-server notification from SSLCommerz. This is the leg that must
// not be skipped: the success redirect only fires if the customer's browser
// survives the trip back from their bank's OTP page, and on mobile it very
// often does not. The IPN arrives regardless, so it is what actually settles
// most real orders.
//
// It answers 200 for anything it understood — SSLCommerz retries on a
// non-200, and re-delivering a callback that was already applied would be
// noise, not repair.

export async function POST(request: Request) {
  const fields = await readCallback(request);
  const gatewayStatus = (fields.status ?? "").toUpperCase();

  if (gatewayStatus === "FAILED" || gatewayStatus === "CANCELLED") {
    const tranId = fields.tran_id?.trim();
    if (tranId) {
      await markUnpaid(tranId, gatewayStatus === "FAILED" ? "failed" : "cancelled", "ipn", {
        callback: fields,
      });
    }
    return NextResponse.json({ received: true, applied: gatewayStatus.toLowerCase() });
  }

  const result = await settlePayment(fields, "ipn");

  if (result.reason) {
    console.error(`[sslcommerz:ipn] ${result.outcome} — ${result.reason}`);
  }

  return NextResponse.json({ received: true, applied: result.outcome });
}

// SSLCommerz's merchant panel pings the IPN URL with a GET when it is saved,
// and treats a 404 or 405 as an unreachable endpoint.
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "sslcommerz-ipn" });
}
