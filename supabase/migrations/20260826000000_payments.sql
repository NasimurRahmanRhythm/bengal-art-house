-- Gallery Hamiduzzaman — SSLCommerz payments
--
-- Run AFTER 20260818000000_init_schema.sql (and the seed, if you want the
-- catalogue in Postgres — checkout resolves every basket line against
-- public.artworks by slug, so the seed is a hard requirement for orders).
--
-- Safe to re-run: every statement is guarded.
--
-- What this adds on top of the initial schema:
--   * 'cancelled' as a payment_status (the customer backed out at the gateway)
--   * the gateway receipt columns the IPN sends back, promoted out of the
--     sslcommerz_response blob so they can be indexed, searched and printed
--     on an invoice without parsing JSON on every read
--   * the delivery address fields the checkout form collects
--   * a customer-facing read path for order_items that joins to artworks

begin;

-- ---------------------------------------------------------------------------
-- 1. orders — payment status gains 'cancelled'
-- ---------------------------------------------------------------------------
-- 'cancelled' and 'failed' are deliberately distinct: failed means the bank
-- declined, cancelled means the customer walked away. They need different
-- follow-up emails, so they cannot share one value.

alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'cancelled'));


-- ---------------------------------------------------------------------------
-- 2. orders — delivery address, split out of the single `address` line
-- ---------------------------------------------------------------------------
-- `address` stays as the street line so nothing already written breaks.

alter table public.orders add column if not exists city     text;
alter table public.orders add column if not exists postcode text;
alter table public.orders add column if not exists country  text not null default 'Bangladesh';


-- ---------------------------------------------------------------------------
-- 3. orders — the SSLCommerz receipt
-- ---------------------------------------------------------------------------
-- val_id is the one the gallery quotes to SSLCommerz support; bank_tran_id is
-- the one the customer sees on their statement. store_amount is what actually
-- lands in the gallery account after the gateway's cut — total_amount minus
-- store_amount is the fee, and that difference is the only place it is
-- recorded, so it is worth a column of its own.

alter table public.orders add column if not exists currency     text not null default 'BDT';
alter table public.orders add column if not exists val_id       text;
alter table public.orders add column if not exists card_type    text;
alter table public.orders add column if not exists card_issuer  text;
alter table public.orders add column if not exists bank_tran_id text;
alter table public.orders add column if not exists store_amount numeric(12, 2);
alter table public.orders add column if not exists risk_level   text;
alter table public.orders add column if not exists risk_title   text;
alter table public.orders add column if not exists paid_at      timestamptz;
alter table public.orders add column if not exists session_key  text;

-- Looking an order up by tran_id happens on every gateway callback, and
-- val_id lookups happen whenever a payment is queried after the fact.
create index if not exists orders_tran_id_idx on public.orders (tran_id);
create index if not exists orders_val_id_idx  on public.orders (val_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);


-- ---------------------------------------------------------------------------
-- 4. order_items — the line snapshot
-- ---------------------------------------------------------------------------
-- The initial schema stores only artwork_id + price_at_purchase and relies on
-- ON DELETE RESTRICT to keep the piece reachable. That holds for the admin
-- panel, which can join. An invoice is different: it is a financial document
-- that must reproduce byte-for-byte years later, even if the piece is renamed
-- or reattributed in the catalogue. So the title and artist are snapshotted
-- too — this is denormalisation on purpose, not an oversight.

alter table public.order_items add column if not exists title_at_purchase  text;
alter table public.order_items add column if not exists artist_at_purchase text;

-- Backfill anything written before this migration.
update public.order_items oi
   set title_at_purchase = a.title
  from public.artworks a
 where a.id = oi.artwork_id
   and oi.title_at_purchase is null;

update public.order_items oi
   set artist_at_purchase = ar.name
  from public.artworks a
  join public.artists  ar on ar.id = a.artist_id
 where a.id = oi.artwork_id
   and oi.artist_at_purchase is null;


-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
-- The customer-facing account pages read orders and order_items with the
-- user's own session, so the "read own" policies from the initial schema are
-- what serve /account. They already exist; recreated here so this file can be
-- run against a database where they were dropped.

drop policy if exists "orders: read own"       on public.orders;
drop policy if exists "order_items: read own"  on public.order_items;

create policy "orders: read own" on public.orders
  for select to authenticated
  using (customer_id = auth.uid());

create policy "order_items: read own" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
    )
  );

-- Orders are created by /api/checkout with the service_role key so the total
-- is computed from catalogue prices and never from the browser. The
-- "orders: create own" INSERT policy from the initial schema is therefore
-- dead weight, and an open door: a customer could POST an order for BDT 1.
drop policy if exists "orders: create own" on public.orders;

commit;


-- ---------------------------------------------------------------------------
-- After running this
-- ---------------------------------------------------------------------------
--
-- Nothing else is needed in Postgres. The remaining setup is environment
-- variables and the SSLCommerz merchant panel — see SSLCOMMERZ-SETUP.md.
