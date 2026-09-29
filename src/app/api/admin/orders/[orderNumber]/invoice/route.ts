import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin/auth";
import { getOrderAsAdmin } from "@/lib/payments/orders";
import { invoiceFromOrder, renderInvoice } from "@/lib/payments/invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The admin's copy of a customer's invoice.
 *
 *  Separate from /api/orders/[orderNumber]/invoice rather than a flag on it,
 *  because the two differ in the only thing that matters here — who is allowed
 *  to ask. The customer's route is authorised by RLS reading their own session;
 *  this one reads past RLS with the service-role key, so it has to do its own
 *  gating, and mixing the two into one handler is how a `?admin=1` hole gets
 *  added later by accident.
 *
 *  Note this path is /api/admin/..., which the middleware's /admin guard does
 *  NOT match — deliberately. Being redirected to a login page is the wrong
 *  answer to a download request; a 403 is the right one. checkAdmin() below is
 *  the real gate either way, and it repeats the middleware's three checks:
 *  a live Supabase session, the admin role read fresh, and a sign-in stamp
 *  inside the window. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const admin = await checkAdmin();
  if (!admin.ok) {
    return NextResponse.json(
      {
        error:
          admin.reason === "expired"
            ? "Your admin session has expired. Sign in again."
            : "Admins only.",
      },
      { status: admin.reason === "not-admin" ? 403 : 401 },
    );
  }

  const { orderNumber } = await params;

  const order = await getOrderAsAdmin(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "No such order." }, { status: 404 });
  }

  const pdf = renderInvoice(invoiceFromOrder(order));

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      "Content-Length": String(pdf.length),
      // A customer's financial record must not sit in a shared cache, and the
      // admin should always get the document as it stands right now.
      "Cache-Control": "private, no-store",
    },
  });
}
