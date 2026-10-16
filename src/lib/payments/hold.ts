// The short hold a work is put on while its buyer is at the payment gateway.
// See supabase/migrations/20261016000000_checkout_holds.sql.
//
// Plain values and functions only, so the checkout route, the settle code,
// the cart check and the admin panel can all share it.

/** How long a buyer has at the gateway before the piece is offered again.
    Long enough for a bKash OTP or a slow 3-D Secure page, short enough that a
    buyer who wandered off does not keep a piece off the market all evening. */
export const HOLD_MINUTES = 30;

/** The status a work really has right now. A checkout hold that has lapsed
    counts as available; a hand-set 'reserved' (no reserved_until) never lapses. */
export function liveStatus(status: unknown, reservedUntil: unknown): string {
  const s = typeof status === "string" && status ? status : "available";
  if (s !== "reserved" || typeof reservedUntil !== "string" || !reservedUntil) return s;
  const until = Date.parse(reservedUntil);
  return Number.isFinite(until) && until < Date.now() ? "available" : s;
}

/** Columns to write alongside any status other than 'reserved', so a hold
    never outlives the status it belonged to. */
export const NO_HOLD = { reserved_until: null, reserved_for_order: null } as const;
