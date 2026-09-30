-- Gallery Hamiduzzaman — record which leg settled each order
--
-- Run AFTER 20260826000000_payments.sql. Safe to re-run.
--
-- Why this column exists
-- ---------------------------------------------------------------------------
-- SSLCommerz confirms a payment twice, by two completely different routes:
--
--   1. the success redirect — the customer's own browser is sent back to
--      /api/payment/success, and that request settles the order
--   2. the IPN — SSLCommerz's server calls /api/payment/ipn directly, with no
--      browser involved
--
-- They race, and either one is enough. The problem is that they send an
-- identical body, so nothing in the database used to say which one did the
-- work — which makes the IPN impossible to test. A payment could succeed with
-- the IPN completely broken, and look exactly the same.
--
-- That matters more here than it sounds. On a phone, a bKash customer leaves
-- the browser for the bKash app, pays, and very often never comes back. No
-- redirect fires. If the IPN is not working, the money is taken and the order
-- sits at 'pending' forever, with nobody aware.
--
-- With this column the test is trivial — pay, kill the browser before it
-- returns, and see whether the order still settles and says 'ipn'. It stays
-- useful afterwards: the share of real orders arriving by 'ipn' is the share
-- that would silently break if the IPN URL were ever wrong.

begin;

alter table public.orders add column if not exists settled_by text;

-- 'checkout' is the one that is not a gateway callback: it means the order
-- never got as far as the gateway, because SSLCommerz refused to open a
-- session (a bad credential, usually). Worth naming, because that failure
-- otherwise looks identical to a customer's card being declined.
alter table public.orders
  drop constraint if exists orders_settled_by_check;

alter table public.orders
  add constraint orders_settled_by_check
  check (settled_by is null or settled_by in ('checkout', 'success', 'fail', 'cancel', 'ipn'));

comment on column public.orders.settled_by is
  'Which route last moved this order off pending: success | ipn | fail | cancel | checkout. Null for orders written before this column existed.';

-- Deliberately NOT backfilled. Every order already in the table could only
-- have been settled by the success redirect, since the IPN was not yet
-- reachable — but writing that in would be an inference dressed up as a
-- record. Null reads as "not recorded", which is the truth.

create index if not exists orders_settled_by_idx on public.orders (settled_by);

commit;


-- ---------------------------------------------------------------------------
-- Checking the IPN after this is deployed
-- ---------------------------------------------------------------------------
--
-- 1. On a phone, buy something cheap and pay with bKash.
-- 2. The moment the payment completes, close the tab before it returns to the
--    site. (Airplane mode works too.)
-- 3. Wait a minute or two, then:
--
--      select order_number, payment_status, settled_by, paid_at
--        from public.orders
--       order by created_at desc
--       limit 5;
--
--    payment_status 'paid' with settled_by 'ipn'  -> the IPN works.
--    still 'pending'                              -> it is not arriving; set
--                                                    the IPN URL in the
--                                                    SSLCommerz merchant panel.
--
-- Afterwards, how much the shop depends on the IPN:
--
--      select settled_by, count(*)
--        from public.orders
--       where payment_status = 'paid'
--       group by settled_by;
