-- Gallery Hamiduzzaman — admin content: pictures, free-text material, press
--
-- Run after 20260821000000_blog_posts.sql, in the Supabase SQL editor.
-- Safe to re-run: every statement is IF NOT EXISTS / OR REPLACE / ON CONFLICT.
--
-- Three things happen here:
--   1. The catalogue tables gain a `photos text[]` column, because a piece is
--      photographed from more than one side and `photo_url` only ever held one.
--   2. `art_group` stops being a required four-value enum. The gallery types
--      the material in its own words ("Bronze on granite base"), so the filter
--      chips on /artworks are now built from whatever materials actually exist
--      rather than from a list fixed in the schema.
--   3. The `media` storage bucket is created, so uploaded pictures have
--      somewhere to live.


-- ---------------------------------------------------------------------------
-- 1. artworks
-- ---------------------------------------------------------------------------

alter table public.artworks add column if not exists photos      text[] not null default '{}';
alter table public.artworks add column if not exists material    text;
alter table public.artworks add column if not exists description text;

-- art_group was `not null check (... in ('bronze','stone','steel','paper'))`.
-- Free text cannot satisfy that, and the column is no longer written at all.
alter table public.artworks alter column art_group drop not null;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.artworks'::regclass
      and conname  = 'artworks_art_group_check'
  ) then
    alter table public.artworks drop constraint artworks_art_group_check;
  end if;
end;
$$;

-- Carry the old single photo and note across, so nothing already entered is
-- lost. Guarded so a second run does not undo an edit made in between.
update public.artworks
   set photos = array[photo_url]
 where photo_url is not null
   and photo_url <> ''
   and photos = '{}';

update public.artworks
   set description = note
 where description is null
   and note is not null;

-- art_group first, not medium: `medium` is a descriptive sentence ("Watercolour
-- on paper, framed") and one of those per artwork turns the filter row on
-- /artworks into a chip per piece. art_group is the short word the chips want.
update public.artworks
   set material = coalesce(initcap(nullif(art_group, '')), nullif(medium, ''))
 where material is null;

-- Corrective, for a database migrated before the line above was fixed: a
-- material that is character-for-character the descriptive medium was written
-- by that earlier backfill, never typed by the gallery, so it is safe to
-- replace. Anything edited by hand since is left alone.
update public.artworks
   set material = initcap(art_group)
 where material = medium
   and coalesce(art_group, '') <> '';


-- ---------------------------------------------------------------------------
-- 2. artists
-- ---------------------------------------------------------------------------

alter table public.artists add column if not exists photos text[] not null default '{}';

update public.artists
   set photos = array[photo_url]
 where photo_url is not null
   and photo_url <> ''
   and photos = '{}';


-- ---------------------------------------------------------------------------
-- 3. exhibitions
-- ---------------------------------------------------------------------------

-- Both free text: a ticket is "Free entry" as often as it is a number, and the
-- hours are read by a person, not parsed.
alter table public.exhibitions add column if not exists photos        text[] not null default '{}';
alter table public.exhibitions add column if not exists ticket_info   text;
alter table public.exhibitions add column if not exists opening_hours text;


-- ---------------------------------------------------------------------------
-- 4. press_releases
-- ---------------------------------------------------------------------------
-- Same shape as `posts` — the admin screens are identical — with `publication`
-- added, because a press item belongs to the paper that ran it.

create table if not exists public.press_releases (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  excerpt       text,
  cover_url     text,
  body_html     text not null default '',
  publication   text,
  author_name   text,
  published     boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint press_releases_published_needs_date
    check (published = false or published_at is not null)
);

create index if not exists press_releases_published_at_idx
  on public.press_releases (published_at desc);

drop trigger if exists set_updated_at on public.press_releases;
create trigger set_updated_at
  before update on public.press_releases
  for each row execute function public.set_updated_at();

alter table public.press_releases enable row level security;

drop policy if exists "press_releases: public read" on public.press_releases;
drop policy if exists "press_releases: admin write" on public.press_releases;

create policy "press_releases: public read" on public.press_releases
  for select to anon, authenticated
  using (published);

create policy "press_releases: admin write" on public.press_releases
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ---------------------------------------------------------------------------
-- 5. Storage
-- ---------------------------------------------------------------------------
-- One public bucket for every uploaded picture. Public means readable by
-- anyone with the URL, which is what a gallery website wants — the pictures are
-- the product being shown.
--
-- Writes are NOT open. Uploads go through a server action holding the
-- service_role key, which bypasses storage RLS entirely, so no insert policy is
-- granted to anon or authenticated below. That is deliberate: the admin panel
-- has no login yet, and a bucket the browser could write to would be a bucket
-- anyone could write to.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  20971520,  -- 20 MB; the app downscales well below this before uploading
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: public read" on storage.objects;

create policy "media: public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');
