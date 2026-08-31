-- Gallery Hamiduzzaman — blog posts
--
-- Run after 20260818000000_init_schema.sql. Safe to re-run: IF NOT EXISTS
-- throughout, and the policies are dropped before being recreated.
--
-- Orders needed no migration — 20260818 already shaped `orders` and
-- `order_items` for SSLCommerz. This adds the one table the admin panel gained
-- that the schema did not already have.

-- posts ----------------------------------------------------------------------
-- `body_html` is the editor's output, stored as markup rather than a portable
-- document model: there is one editor and one renderer, so a JSON tree would
-- buy portability nobody has asked for. It is sanitised in the client before
-- it is written, and rendered from a trusted-admin source only.
--
-- published_at is separate from created_at because a draft can sit for weeks:
-- the list sorts on when it went live, not when it was started. It is stamped
-- once, the first time `published` flips true, and left alone after that so
-- editing an old post does not shuffle it back to the top.
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  excerpt       text,
  cover_url     text,
  body_html     text not null default '',
  tag           text,
  author_id     uuid references public.profiles (id) on delete set null,
  author_name   text,
  published     boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- A post cannot claim to be live without a date on it; the app sets both
  -- together, and this stops a hand-run UPDATE from splitting them.
  constraint posts_published_needs_date
    check (published = false or published_at is not null)
);

create index if not exists posts_published_at_idx on public.posts (published_at desc);
create index if not exists posts_published_idx    on public.posts (published);


-- Triggers -------------------------------------------------------------------
drop trigger if exists set_updated_at on public.posts;
create trigger set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();


-- RLS ------------------------------------------------------------------------
-- Same shape as artists/artworks/exhibitions: anyone reads what is published,
-- only admins write. Admins still see drafts because the policies are OR'd and
-- the admin policy covers SELECT too.
alter table public.posts enable row level security;

drop policy if exists "posts: public read" on public.posts;
drop policy if exists "posts: admin write" on public.posts;

create policy "posts: public read" on public.posts
  for select to anon, authenticated
  using (published);

create policy "posts: admin write" on public.posts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
