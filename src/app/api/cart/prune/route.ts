import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tells the browser which basket lines are no longer purchasable.
 *
 *  The cart lives in localStorage, so it only ever changes when some page
 *  decides to change it. That is the wrong shape for a gallery selling unique
 *  pieces: the moment a work is paid for it is gone, and every other basket
 *  holding it — including the buyer's own — is stale.
 *
 *  Returning the unavailable slugs rather than the available ones is
 *  deliberate: if this endpoint ever breaks or is misread, the failure mode is
 *  "nothing was removed", never "the basket was emptied".
 *
 *  Public on purpose. It reveals only whether a piece is still for sale, which
 *  is what the catalogue page already says out loud. */
export async function POST(request: Request) {
  let items: unknown;
  try {
    ({ items } = (await request.json()) as { items?: unknown });
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const slugs = Array.isArray(items)
    ? [...new Set(items.filter((s): s is string => typeof s === "string" && s.length > 0))].slice(
        0,
        50,
      )
    : [];

  if (slugs.length === 0) return NextResponse.json({ unavailable: [] });

  const db = createAdminClient();

  const { data, error } = await db
    .from("artworks")
    .select("slug, status, published, price")
    .in("slug", slugs);

  if (error) {
    console.error("[cart/prune] artwork lookup failed", error);
    // Say nothing is unavailable rather than guessing — see the note above.
    return NextResponse.json({ unavailable: [] });
  }

  const purchasable = new Set(
    (data ?? [])
      .filter((w) => w.published && w.status === "available" && Number(w.price) > 0)
      .map((w) => w.slug),
  );

  // Anything sold, reserved, unpublished, left without a price, or gone from
  // the catalogue entirely.
  // 'reserved' is included because /api/checkout refuses it too — leaving one
  // in the basket only buys the customer a rejection at the last step.
  return NextResponse.json({
    unavailable: slugs.filter((slug) => !purchasable.has(slug)),
  });
}
