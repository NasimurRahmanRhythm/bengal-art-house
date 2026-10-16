-- Gallery Hamiduzzaman — hold a work while its buyer is at the payment gateway
--
-- Run AFTER 20261015000000_press_daily_star_beyond_boundaries.sql, and BEFORE
-- deploying the code that calls reserve_artworks(): checkout fails without it.
-- Safe to re-run.
--
-- Every work is unique. Checkout used to check only that a piece was
-- 'available' when the buyer pressed Pay, so two buyers paying at the same
-- moment could both be charged for it. Now checkout puts the piece on a short
-- hold for that one order before sending the buyer to SSLCommerz:
--
--   * status becomes 'reserved', with reserved_until and reserved_for_order
--     saying whose hold it is and until when;
--   * a paid order turns the hold into 'sold'; a failed or cancelled one
--     releases it straight away;
--   * a buyer who simply walks away leaves a hold that lapses on its own at
--     reserved_until — the code treats a lapsed hold as 'available'.
--
-- A 'reserved' set by hand in the admin panel has no reserved_until and never
-- lapses, exactly as before.

alter table public.artworks add column if not exists reserved_until timestamptz;
alter table public.artworks
  add column if not exists reserved_for_order uuid references public.orders (id) on delete set null;

-- Holds every listed work for one order, or none of them. Run as a single
-- statement inside one transaction, so two checkouts racing for the same piece
-- cannot both win: the second one's update finds the row already held and the
-- whole call is rolled back.
create or replace function public.reserve_artworks(
  p_order   uuid,
  p_ids     uuid[],
  p_minutes integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  held integer;
begin
  update public.artworks
     set status             = 'reserved',
         reserved_until     = now() + make_interval(mins => p_minutes),
         reserved_for_order = p_order
   where id = any (p_ids)
     and (
           status = 'available'
        or (status = 'reserved' and reserved_until is not null and reserved_until < now())
     );

  get diagnostics held = row_count;

  if held <> coalesce(array_length(p_ids, 1), 0) then
    raise exception 'artwork_unavailable' using errcode = 'P0001';
  end if;

  return true;
end;
$$;

-- Only the server (service role) may place holds; a visitor calling this
-- through the public API could otherwise lock up the whole catalogue.
revoke execute on function public.reserve_artworks(uuid, uuid[], integer) from public, anon, authenticated;
grant  execute on function public.reserve_artworks(uuid, uuid[], integer) to service_role;
