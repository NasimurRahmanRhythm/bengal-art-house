-- Gallery Hamiduzzaman — governing body
--
-- Run after 20260901000000_fix_admin_password_guard.sql. Safe to re-run.
--
-- The people who run the gallery, as opposed to the people whose work it
-- shows. A separate table from `artists` rather than a flag on it: a trustee is
-- not an artist with a box ticked, has no works, no slug and no page of their
-- own, and the two lists are edited by different people for different reasons.

create table if not exists public.governing_body (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text,
  bio          text,
  photo_url    text,
  -- Hand-ordered. A governing body has a precedence — chair first — that no
  -- sort on name or date will ever produce.
  order_index  integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists governing_body_order_idx
  on public.governing_body (order_index);

drop trigger if exists set_updated_at on public.governing_body;
create trigger set_updated_at
  before update on public.governing_body
  for each row execute function public.set_updated_at();

alter table public.governing_body enable row level security;

drop policy if exists "governing_body: public read" on public.governing_body;
drop policy if exists "governing_body: admin write" on public.governing_body;

create policy "governing_body: public read" on public.governing_body
  for select to anon, authenticated
  using (published);

create policy "governing_body: admin write" on public.governing_body
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
