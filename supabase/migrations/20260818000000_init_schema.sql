-- Gallery Hamiduzzaman — Phase 2, step 2: initial schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every object uses IF NOT EXISTS / OR REPLACE, and policies are
-- dropped before being recreated.
--
-- Auth model this schema enforces:
--   Customer — email + password signup, verified by a 6-digit emailed code.
--              Signs in afterwards with email + password.
--   Admin    — never has a password. The email must be listed in
--              admin_allowlist first; sign-in is always email + 6-digit code.
--
-- Ordering matters below: LANGUAGE SQL function bodies are validated when the
-- function is created, so every table a function reads must already exist.
-- That is why all functions come after all tables.

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto;  -- gen_random_uuid()


-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

-- profiles ------------------------------------------------------------------
-- One row per auth.users row — customers and admins alike. `role` is set
-- automatically from admin_allowlist; never trust a client to write it.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  role        text not null default 'customer'
              check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- admin_allowlist -----------------------------------------------------------
-- The list of emails permitted to hold admin access. Seeded by hand (see the
-- notes at the bottom). An email must appear here BEFORE that person ever
-- signs in — this table, not the signup form, is what grants admin.
create table if not exists public.admin_allowlist (
  email       text primary key,
  note        text,
  added_by    uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- artists -------------------------------------------------------------------
-- `bio` is text[] (paragraphs) and `facts` is jsonb ([{label, value}, ...]),
-- mirroring the Artist type in src/data/gallery.ts.
create table if not exists public.artists (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  role        text,
  initials    text,
  body        text,
  bio         text[] not null default '{}',
  facts       jsonb  not null default '[]'::jsonb,
  photo_url   text,
  plate       integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- artworks ------------------------------------------------------------------
-- NOTE: PLAN.md calls the medium-family column `group`, but that is a reserved
-- SQL keyword — it is `art_group` here. Alias it back in queries when needed:
--   .select('id, title, group:art_group')
create table if not exists public.artworks (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  artist_id   uuid not null references public.artists (id) on delete restrict,
  title       text not null,
  art_group   text not null
              check (art_group in ('bronze', 'stone', 'steel', 'paper')),
  medium      text,
  price       numeric(12, 2) not null check (price >= 0),
  status      text not null default 'available'
              check (status in ('available', 'sold', 'reserved')),
  photo_url   text,
  year        text,
  dimensions  text,
  note        text,
  plate       integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists artworks_artist_id_idx on public.artworks (artist_id);
create index if not exists artworks_status_idx    on public.artworks (status);
create index if not exists artworks_art_group_idx on public.artworks (art_group);

-- exhibitions ---------------------------------------------------------------
-- current/upcoming/past is derived from the dates rather than stored, so it
-- can never drift. `date_label` keeps the display string ("14 August —
-- 4 September 2025", or just "1976" where only the year is known).
create table if not exists public.exhibitions (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  venue       text,
  date_start  date,
  date_end    date,
  date_label  text,
  year        text,
  tag         text,
  blurb       text,
  plate       integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists exhibitions_date_start_idx on public.exhibitions (date_start);

-- collaborations ------------------------------------------------------------
create table if not exists public.collaborations (
  id           uuid primary key default gen_random_uuid(),
  place        text not null,
  title        text not null,
  body         text,
  years        text,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- services ------------------------------------------------------------------
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text,
  icon         text not null
               check (icon in ('advisory', 'catalog', 'restore',
                               'provenance', 'public', 'valuation')),
  order_index  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- works ---------------------------------------------------------------------
-- Public installations listed on /about — not for sale, distinct from artworks.
create table if not exists public.works (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  medium       text,
  location     text,
  order_index  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- enquiries -----------------------------------------------------------------
-- Contact-form submissions. customer_id is null for guests.
create table if not exists public.enquiries (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references public.profiles (id) on delete set null,
  artwork_id   uuid references public.artworks (id) on delete set null,
  name         text not null,
  email        text not null,
  phone        text,
  message      text not null,
  status       text not null default 'new'
               check (status in ('new', 'read')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists enquiries_status_idx      on public.enquiries (status);
create index if not exists enquiries_customer_id_idx on public.enquiries (customer_id);

-- orders --------------------------------------------------------------------
-- Not used until SSLCommerz is wired up, but shaped now so it needs no
-- retrofitting. tran_id / sslcommerz_response keep the raw gateway response
-- for payment-dispute audit trails.
create sequence if not exists public.order_number_seq;

create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  order_number         text not null unique
                       default 'GH-' || to_char(now(), 'YYYY') || '-'
                               || lpad(nextval('public.order_number_seq')::text, 5, '0'),
  customer_id          uuid references public.profiles (id) on delete set null,
  customer_name        text not null,
  email                text not null,
  phone                text,
  address              text,
  total_amount         numeric(12, 2) not null check (total_amount >= 0),
  payment_status       text not null default 'pending'
                       check (payment_status in ('pending', 'paid', 'failed')),
  tran_id              text unique,
  sslcommerz_response  jsonb,
  fulfillment_status   text not null default 'pending'
                       check (fulfillment_status in ('pending', 'shipped', 'completed')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists orders_customer_id_idx    on public.orders (customer_id);
create index if not exists orders_payment_status_idx on public.orders (payment_status);

-- order_items ---------------------------------------------------------------
create table if not exists public.order_items (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references public.orders (id) on delete cascade,
  artwork_id         uuid not null references public.artworks (id) on delete restrict,
  price_at_purchase  numeric(12, 2) not null check (price_at_purchase >= 0),
  created_at         timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);


-- ---------------------------------------------------------------------------
-- 2. Functions
-- ---------------------------------------------------------------------------

-- Keeps updated_at honest on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Admin check used by every write policy below.
--
-- SECURITY DEFINER is required: without it this function would read profiles
-- under the caller's own RLS, and since the profiles policies themselves call
-- is_admin(), that recurses infinitely.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Is this email allowed to be an admin?
--
-- Deliberately NOT granted to anon: an anonymous caller able to ask "is this
-- an admin?" is an account-enumeration oracle. The admin sign-in server action
-- should call this with the service_role key instead, and reply with the same
-- neutral message either way ("if that address is registered, a code is on its
-- way") so the UI never confirms whether an address is an admin.
create or replace function public.is_admin_email(check_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_allowlist
    where email = lower(trim(check_email))
  );
$$;

revoke execute on function public.is_admin_email(text) from public, anon, authenticated;
grant execute on function public.is_admin_email(text) to service_role;

-- Store allowlist emails in one canonical form so lookups always match.
create or replace function public.normalize_admin_email()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

-- Blocks a customer promoting themselves to admin.
--
-- This lives in a trigger rather than in the UPDATE policy's WITH CHECK,
-- because a profiles policy that reads profiles causes infinite RLS recursion.
-- The transaction-local app.role_sync flag lets the allowlist sync below make
-- legitimate role changes without tripping this guard.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('app.role_sync', true), '') = 'on' then
    return new;
  end if;

  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

-- Creates the profile row on signup, granting admin only if the address was
-- already on the allowlist.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    case when public.is_admin_email(new.email) then 'admin' else 'customer' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Admin accounts must never be reachable by password.
--
-- Without this, an attacker who guessed an allowlisted address could register
-- it with a password of their choosing before the real admin ever signed in,
-- and the trigger above would hand them the admin role. Passwordless (OTP)
-- signups leave encrypted_password empty, so they pass.
--
-- Scoped to allowlisted emails only: if this check is ever wrong about how
-- GoTrue stores an empty password it can only affect admin sign-up, never
-- ordinary customer sign-up, and it fails closed rather than open.
create or replace function public.guard_admin_password_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Nested rather than a single AND: PL/pgSQL does not promise to short-circuit,
  -- and touching OLD during an INSERT raises "record old is not assigned yet".
  if tg_op = 'UPDATE' then
    if new.encrypted_password is not distinct from old.encrypted_password then
      return new;
    end if;
  end if;

  if public.is_admin_email(new.email)
     and coalesce(new.encrypted_password, '') <> '' then
    raise exception
      'Admin accounts sign in with a one-time code, not a password (%)', new.email
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

-- Keeps profiles.role in step with the allowlist, so an address can be granted
-- or revoked admin after the account already exists.
create or replace function public.sync_admin_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_password boolean;
begin
  perform set_config('app.role_sync', 'on', true);  -- transaction-local

  if tg_op in ('INSERT', 'UPDATE') then
    -- Refuse to hand admin to an address that already has a password login.
    select coalesce(u.encrypted_password, '') <> ''
      into has_password
      from auth.users u
     where lower(u.email) = new.email;

    if has_password then
      raise exception
        'Cannot grant admin to % — that account has a password. Admin sign-in is one-time-code only; delete the account first.',
        new.email
        using errcode = 'check_violation';
    end if;

    update public.profiles p
       set role = 'admin'
      from auth.users u
     where u.id = p.id
       and lower(u.email) = new.email
       and p.role <> 'admin';
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    update public.profiles p
       set role = 'customer'
      from auth.users u
     where u.id = p.id
       and lower(u.email) = old.email
       and not public.is_admin_email(u.email);
  end if;

  perform set_config('app.role_sync', 'off', true);
  return null;
end;
$$;


-- ---------------------------------------------------------------------------
-- 3. Triggers
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'artists', 'artworks', 'exhibitions', 'collaborations',
    'services', 'works', 'enquiries', 'orders'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

drop trigger if exists normalize_admin_email on public.admin_allowlist;
create trigger normalize_admin_email
  before insert or update on public.admin_allowlist
  for each row execute function public.normalize_admin_email();

drop trigger if exists sync_admin_allowlist on public.admin_allowlist;
create trigger sync_admin_allowlist
  after insert or update or delete on public.admin_allowlist
  for each row execute function public.sync_admin_allowlist();

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists guard_admin_password_signup on auth.users;
create trigger guard_admin_password_signup
  before insert or update on auth.users
  for each row execute function public.guard_admin_password_signup();

-- Backfill profiles for any users that already exist.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles        enable row level security;
alter table public.admin_allowlist enable row level security;
alter table public.artists         enable row level security;
alter table public.artworks        enable row level security;
alter table public.exhibitions     enable row level security;
alter table public.collaborations  enable row level security;
alter table public.services        enable row level security;
alter table public.works           enable row level security;
alter table public.enquiries       enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles: read own"    on public.profiles;
drop policy if exists "profiles: admin read"  on public.profiles;
drop policy if exists "profiles: update own"  on public.profiles;
drop policy if exists "profiles: admin write" on public.profiles;

create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles: admin read" on public.profiles
  for select to authenticated
  using (public.is_admin());

-- Self-promotion is blocked by guard_profile_role, not by a WITH CHECK
-- subquery — see the note on that function.
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin write" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- admin_allowlist -----------------------------------------------------------
-- No public read at all: this is the list of addresses worth attacking. Only
-- signed-in admins may see or change it; the sign-in flow reads it through
-- is_admin_email() with the service_role key.
drop policy if exists "admin_allowlist: admin manage" on public.admin_allowlist;

create policy "admin_allowlist: admin manage" on public.admin_allowlist
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Catalogue tables ----------------------------------------------------------
-- Anyone (including anon) reads, only admins write. The three tables that
-- carry a `published` flag hide unpublished rows from the public; admins still
-- see them, because policies are OR'd and the admin policy covers SELECT too.
do $$
declare
  t text;
  read_expr text;
begin
  foreach t in array array[
    'artists', 'artworks', 'exhibitions', 'collaborations', 'services', 'works'
  ]
  loop
    if t in ('artists', 'artworks', 'exhibitions') then
      read_expr := 'published';
    else
      read_expr := 'true';
    end if;

    execute format('drop policy if exists "%s: public read" on public.%I', t, t);
    execute format('drop policy if exists "%s: admin write" on public.%I', t, t);

    execute format(
      'create policy "%s: public read" on public.%I
         for select to anon, authenticated using (%s)', t, t, read_expr);

    execute format(
      'create policy "%s: admin write" on public.%I
         for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end;
$$;

-- enquiries -----------------------------------------------------------------
drop policy if exists "enquiries: anyone submit" on public.enquiries;
drop policy if exists "enquiries: read own"      on public.enquiries;
drop policy if exists "enquiries: admin manage"  on public.enquiries;

-- The contact form is open to guests, so anon may INSERT. A signed-in user
-- may only attribute an enquiry to themselves.
create policy "enquiries: anyone submit" on public.enquiries
  for insert to anon, authenticated
  with check (customer_id is null or customer_id = auth.uid());

create policy "enquiries: read own" on public.enquiries
  for select to authenticated
  using (customer_id = auth.uid());

create policy "enquiries: admin manage" on public.enquiries
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- orders --------------------------------------------------------------------
-- Orders are normally written server-side with the service_role key (which
-- bypasses RLS) so totals can't be tampered with. These policies cover the
-- read path and a signed-in customer creating their own order.
drop policy if exists "orders: read own"     on public.orders;
drop policy if exists "orders: create own"   on public.orders;
drop policy if exists "orders: admin manage" on public.orders;

create policy "orders: read own" on public.orders
  for select to authenticated
  using (customer_id = auth.uid());

create policy "orders: create own" on public.orders
  for insert to authenticated
  with check (customer_id = auth.uid());

create policy "orders: admin manage" on public.orders
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- order_items ---------------------------------------------------------------
drop policy if exists "order_items: read own"     on public.order_items;
drop policy if exists "order_items: admin manage" on public.order_items;

create policy "order_items: read own" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
    )
  );

create policy "order_items: admin manage" on public.order_items
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- ---------------------------------------------------------------------------
-- 5. After running this — seed your admin addresses
-- ---------------------------------------------------------------------------
--
-- Nobody is an admin yet, and no signup form can make one. Add the addresses
-- here first; each person then signs in at /admin/login with a one-time code,
-- and picks up the admin role automatically when their account is created.
--
--   insert into public.admin_allowlist (email, note) values
--     ('rhythm4538@gmail.com', 'owner')
--   on conflict (email) do nothing;
--
-- To revoke, delete the row — the sync trigger drops that account back to
-- 'customer' immediately:
--
--   delete from public.admin_allowlist where email = 'someone@example.com';
--
-- ---------------------------------------------------------------------------
-- Dashboard settings this schema assumes (Authentication → ...)
-- ---------------------------------------------------------------------------
--
-- Menu names below match the current dashboard layout (Aug 2026). Older docs
-- call these "Providers" and "Email Templates"; they were reorganised.
--
-- 0. PREREQUISITE — custom SMTP. Supabase's built-in email service does not
--    allow editing templates, so {{ .Token }} cannot be set without it, and
--    the default template sends a LINK, not a 6-digit code. The built-in
--    service is also capped at ~2 emails/hour. Set SMTP up first
--    (Authentication → Emails → SMTP), otherwise every step below is blocked.
--    Brevo works without owning a domain (verify a single sender address);
--    Resend needs a verified domain to mail arbitrary recipients.
--    Afterwards raise Authentication → Rate Limits → email above the default.
-- 1. Authentication → Sign In / Providers → Email: enabled, "Confirm email" ON.
-- 2. Authentication → Emails (under NOTIFICATIONS) → Templates tab →
--    "Confirm signup": replace {{ .ConfirmationURL }} with {{ .Token }} so the
--    customer receives a 6-digit code instead of a link.
-- 3. Same screen → "Magic Link" template: same swap to {{ .Token }} — this is
--    the template used for admin one-time-code sign-in.
-- 4. Authentication → Sign In / Providers → Email → "Email OTP Expiration":
--    600 (10 minutes) or less.
--
-- Client calls that match the above:
--   Customer signup    supabase.auth.signUp({ email, password })
--                      then verifyOtp({ email, token, type: 'signup' })
--   Customer sign-in   supabase.auth.signInWithPassword({ email, password })
--   Admin sign-in      server action checks is_admin_email() with the
--                      service_role key, then signInWithOtp({ email }),
--                      then verifyOtp({ email, token, type: 'email' })
--
-- Do NOT expose an "is this an admin?" answer to the browser — reply with the
-- same neutral message whether or not the address is on the list.
