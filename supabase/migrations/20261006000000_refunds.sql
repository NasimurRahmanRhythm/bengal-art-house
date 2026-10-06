-- Gallery Hamiduzzaman — recording refunds
--
-- Run AFTER 20260930000000_settled_by.sql. Safe to re-run.
--
-- The money itself is sent back from the SSLCommerz merchant panel, by hand.
-- Nothing here talks to the gateway. What this adds is the gallery's own
-- record of that refund, so an order that has been paid back no longer reads
-- 'paid' in the admin panel, in the customer's profile and on the invoice.
--
--   * 'refunded' as a payment_status
--   * how much went back — the Return Policy allows customs and other costs
--     (up to 5%) to be kept, so this is not always the order total
--   * why, the SSLCommerz refund reference, and when

begin;

-- ---------------------------------------------------------------------------
-- 1. orders — payment status gains 'refunded'
-- ---------------------------------------------------------------------------

alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'cancelled', 'refunded'));


-- ---------------------------------------------------------------------------
-- 2. orders — the refund record
-- ---------------------------------------------------------------------------

alter table public.orders add column if not exists refund_amount numeric(12, 2);
alter table public.orders add column if not exists refund_reason text;
alter table public.orders add column if not exists refund_ref    text;
alter table public.orders add column if not exists refunded_at   timestamptz;

-- A refund is never more than what was charged, and never nothing.
alter table public.orders
  drop constraint if exists orders_refund_amount_check;

alter table public.orders
  add constraint orders_refund_amount_check
  check (refund_amount is null or (refund_amount > 0 and refund_amount <= total_amount));

comment on column public.orders.refund_amount is
  'What was paid back through SSLCommerz. May be less than total_amount when the Return Policy deductions apply.';
comment on column public.orders.refund_ref is
  'The refund reference SSLCommerz shows in the merchant panel, if one was given.';

commit;
