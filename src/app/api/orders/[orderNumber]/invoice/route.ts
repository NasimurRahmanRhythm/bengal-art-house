import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMyOrder } from "@/lib/payments/orders";
import { renderInvoice } from "@/lib/payments/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Builds the customer's invoice on demand rather than storing a file.
 *
 *  Nothing on it is derived from anything mutable — the line titles, artists
 *  and prices are all snapshots taken at checkout — so the PDF generated a
 *  year from now is byte-identical to the one generated the day it was paid,
 *  and there is no object storage to keep in step. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to download your invoice." }, { status: 401 });
  }

  // RLS does the ownership check: getMyOrder reads through the user's own
  // session, so somebody else's order number simply returns nothing.
  const order = await getMyOrder(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "No such order." }, { status: 404 });
  }

  const pdf = renderInvoice({
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
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      "Content-Length": String(pdf.length),
      "Cache-Control": "private, no-store",
    },
  });
}
