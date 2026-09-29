# SSLCommerz — what you need to do

The code is finished. This file is the list of things that live **outside** the
repo: the merchant account, the environment variables, and the database
migration. Work down it in order — each step depends on the one above it.

---

## 1. Get a store

**Sandbox** (free, instant, no paperwork) —
<https://developer.sslcommerz.com/registration/>

Fill in the form, confirm the email, and the sandbox panel gives you a
**Store ID** and a **Store Password (API key)**. They look like:

```
Store ID        gally68adf12345678
Store Password  gally68adf12345678@ssl
```

**Live** — apply at <https://sslcommerz.com/> ("Get Started"). This one is a
real merchant onboarding and takes a few working days. They will ask for:

- Trade licence
- TIN certificate
- NID of the owner / authorised signatory
- Bank account details (the account settlements are paid into)
- The live website URL, with the product and refund pages reachable

A live store gives you a **different** Store ID and Store Password. Sandbox
credentials never work against the live endpoint and vice versa.

---

## 2. Set the URLs in the merchant panel

Log in to the panel (sandbox: <https://sandbox.sslcommerz.com/manage/>, live:
<https://report.sslcommerz.com/>).

### IPN — this is the important one

**My Stores → (your store) → IPN Settings → IPN URL:**

```
https://YOUR-DOMAIN.com/api/payment/ipn
```

Set the format to **POST**. Save.

Why it matters: the success redirect only fires if the customer's browser
survives the round trip back from their bank's OTP screen. On mobile it very
often does not — they close the bKash app and never return. The IPN is a
server-to-server call that arrives regardless, and it is what actually settles
most real orders. **Without it, real payments will sit as `pending` forever.**

The success / fail / cancel URLs are sent by the code on every transaction, so
there is nothing to configure for those. For the record they are:

| Leg | URL |
| --- | --- |
| Success | `https://YOUR-DOMAIN.com/api/payment/success` |
| Fail | `https://YOUR-DOMAIN.com/api/payment/fail` |
| Cancel | `https://YOUR-DOMAIN.com/api/payment/cancel` |
| IPN | `https://YOUR-DOMAIN.com/api/payment/ipn` |

### Other panel settings worth checking

- **Store Status** — must be *Active*.
- **Payment methods** — tick the ones you want on the hosted page: cards,
  bKash, Nagad, Rocket, Upay, internet banking. Anything left off will not be
  offered to the customer.
- **Domain whitelisting** — some live stores are locked to a domain list. If
  the gateway starts refusing sessions after go-live, this is the first place
  to look.

---

## 3. Environment variables

### Local — `.env.local`

Already stubbed out for you. Fill in the two blanks:

```dotenv
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
SSLCOMMERZ_IS_LIVE=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Vercel — Settings → Environment Variables

Every one of these has to be added by hand. Vercel cannot see `.env.local`.

| Variable | Value | Scope |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase | all |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase | all |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase | all |
| `SSLCOMMERZ_STORE_ID` | store id | all |
| `SSLCOMMERZ_STORE_PASSWORD` | store password | all |
| `SSLCOMMERZ_IS_LIVE` | `false` on preview, `true` on production | per-environment |
| `NEXT_PUBLIC_SITE_URL` | `https://www.galleryhamiduzzaman.com` | production |

Two things that will bite otherwise:

- **The three Supabase keys are probably still missing on Vercel.** They only
  exist locally right now, and the build has already broken once over it.
- `NEXT_PUBLIC_SITE_URL` must have **no trailing slash** and must be the real
  public origin. It is what the customer is redirected back to after paying;
  a stale value sends paying customers to the wrong host.

Redeploy after adding them — env vars are baked in at build time.

---

## 4. Run the database migration

Supabase Dashboard → SQL Editor → New query. Paste and run, in this order:

1. `supabase/migrations/20260818000000_init_schema.sql` — if not already run
2. `supabase/migrations/20260819000000_seed_data.sql` — **required**, see below
3. `supabase/migrations/20260826000000_payments.sql` — the new one

All three are safe to re-run.

> **The seed is not optional.** Checkout resolves every basket line against
> `public.artworks` by slug and reads the price from there, so that a tampered
> basket can change *what* is bought but never *what it costs*. If the table is
> empty, every checkout fails with "Some works in your selection are no longer
> listed" — and the server log will name the missing slugs.

---

## 5. Testing locally

The redirect legs (success / fail / cancel) work fine against
`http://localhost:3000`. The **IPN does not** — SSLCommerz's servers cannot
reach your machine. To test the full flow, put a tunnel in front:

```bash
npx cloudflared tunnel --url http://localhost:3000
# or:  ngrok http 3000
```

Take the `https://…` URL it prints and:

1. set `NEXT_PUBLIC_SITE_URL` to it in `.env.local`
2. set the IPN URL in the sandbox panel to `<that URL>/api/payment/ipn`
3. restart `npm run dev` (env vars are read at boot)

### Sandbox test credentials

The sandbox payment page prints the current test credentials at the top of
each tab — always trust what is on screen over what is written here. The
usual ones:

| Method | Details |
| --- | --- |
| Visa | `4111 1111 1111 1111`, any future expiry, CVV `111`, OTP `111111` |
| Mastercard | `5111 1111 1111 1111`, same |
| bKash / Nagad / Rocket | the sandbox tab shows a test wallet number and PIN |

No real money moves in sandbox, whatever the amounts say.

### Walk the whole path

1. Add a work to the cart → **Proceed to checkout**
2. Sign in (or create an account) if you are not already
3. Fill in name + phone → **Pay**
4. Pay on the SSLCommerz page
5. You land back on `/checkout/result` with the payment confirmed
6. Profile icon in the navbar → `/account` → the order is listed
7. Open the order → **Download invoice** → a PDF lands in Downloads

Then test the unhappy paths too: press **Cancel** on the gateway page, and
fail a card deliberately. Both should return you to `/checkout/result` with the
right message, and the basket should still be intact.

---

## 6. Going live

- [ ] Live store approved, credentials in hand
- [ ] `SSLCOMMERZ_IS_LIVE=true` on Vercel **production only**
- [ ] `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASSWORD` swapped to the live pair
- [ ] `NEXT_PUBLIC_SITE_URL` = the real domain
- [ ] IPN URL set in the **live** panel (it is a separate panel — the sandbox
      setting does not carry over)
- [ ] Redeployed after changing env vars
- [ ] One real low-value transaction end to end, then check it appears in the
      SSLCommerz report panel **and** in `public.orders` with
      `payment_status = 'paid'`
- [ ] Settlement bank account confirmed in the panel

---

## What was built

### Database — `supabase/migrations/20260826000000_payments.sql`

- `payment_status` gains `cancelled` (distinct from `failed`: one is the
  customer walking away, the other is the bank declining — different follow-up)
- gateway receipt columns on `orders`: `val_id`, `bank_tran_id`, `card_type`,
  `card_issuer`, `store_amount`, `risk_level`, `paid_at`, `currency`, `session_key`
- delivery address: `city`, `postcode`, `country`
- `order_items` snapshots `title_at_purchase` / `artist_at_purchase`, so an
  invoice reprinted in five years still says what was actually bought
- drops the `orders: create own` INSERT policy — orders are priced and written
  server-side with the service-role key, and that policy was an open door to a
  customer POSTing themselves a BDT 1 order

### Code

| Path | What it does |
| --- | --- |
| `src/lib/payments/sslcommerz.ts` | Session init, transaction validation, IPN signature check. No npm dependency. |
| `src/lib/payments/settle.ts` | The one place that decides a payment is real. Shared by all four callbacks. |
| `src/lib/payments/orders.ts` | Reads the customer's own orders, through their session so RLS enforces ownership. |
| `src/lib/payments/pdf.ts` | A small PDF writer — base-14 Helvetica, real text metrics, no dependency. |
| `src/lib/payments/invoice.ts` | The invoice layout. |
| `src/app/api/checkout/route.ts` | Prices the basket from Postgres, creates the order, opens the gateway session. |
| `src/app/api/payment/{success,fail,cancel,ipn}/route.ts` | The four gateway callbacks. |
| `src/app/api/orders/[orderNumber]/invoice/route.ts` | Generates and downloads the PDF invoice. |
| `src/app/(site)/checkout/` | Checkout form and the post-payment result page. |
| `src/app/(site)/account/` | Profile, order history, order detail. |

### How a payment is authorised

The browser sends **only the slugs** in the basket. Everything else — titles,
prices, availability — is read back out of Postgres server-side, so a tampered
basket can change what is bought but never what it costs.

Nothing is marked `paid` on the strength of the redirect. The gateway returns
the customer with a browser POST that anyone could forge, so the server calls
SSLCommerz's validator API with the store password over a channel the customer
cannot touch, and checks three things: the transaction id matches, the currency
matches, and the amount is not short. Only then does the order settle and the
works come off the market.

The success redirect and the IPN race each other; whichever arrives first does
the work, and the second sees the order already paid and does nothing.

---

## Known gaps — decide if you want these

1. **The admin dashboard will not show these orders.** `/admin/orders` still
   reads `src/lib/admin/store.tsx`, which is a localStorage preview store —
   the file says as much in its own header comment. Real orders go to Postgres.
   Rewiring the admin panel to Supabase is a separate piece of work that
   touches every admin screen, so it is left as your call rather than folded
   in here. Until then, paid orders are visible in the Supabase table editor
   and in the SSLCommerz report panel.

2. **The public artwork pages read `src/data/artworks.ts`, not the database.**
   A paid order marks the piece `sold` in Postgres, but the `/artworks` page is
   built from the static file and will keep showing it as available. Same root
   cause as (1) — the public pages have not been moved to Supabase yet.

3. **No order confirmation email.** The customer sees the confirmation page and
   the order in their profile, but nothing lands in their inbox. Supabase SMTP
   is already configured for auth codes, so this is a small addition when you
   want it.

4. **No refund flow.** SSLCommerz supports refunds through their API; nothing
   in the app calls it. Refunds are done from the merchant panel by hand for
   now, and the order row will still read `paid` afterwards.
