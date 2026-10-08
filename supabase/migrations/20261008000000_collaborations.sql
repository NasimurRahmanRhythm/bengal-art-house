-- Gallery Hamiduzzaman — collaborations managed from the admin panel
--
-- Run AFTER 20261007000000_post_video.sql. Safe to re-run.
--
-- Collaborations used to be four fixed rows about the founding artist's
-- travels (Baroda, Seoul, ...), written into the seed file. They are now the
-- gallery's partner exhibitions and projects, added and edited from the admin
-- panel, each with its own page — the same shape as an exhibition: pictures,
-- the artists involved, dates and a write-up.
--
--   1. The table gains the columns the new pages need.
--   2. The four placeholder rows from the seed are removed, matched by title
--      and by having no slug, so nothing added from the admin is touched.
--   3. Public reads respect `published`, like exhibitions and artists.

begin;

-- ---------------------------------------------------------------------------
-- 1. the new shape
-- ---------------------------------------------------------------------------
-- `title` and `body` keep their meaning; `body` now holds the full write-up
-- (paragraphs separated by blank lines). `place` stays as an optional
-- location and loses its NOT NULL. `years` and `order_index` are no longer
-- written: the list is ordered by date, newest first.

alter table public.collaborations alter column place drop not null;

alter table public.collaborations add column if not exists slug       text;
alter table public.collaborations add column if not exists subtitle   text;
alter table public.collaborations add column if not exists artists    text;
alter table public.collaborations add column if not exists date_start date;
alter table public.collaborations add column if not exists date_end   date;
alter table public.collaborations add column if not exists date_label text;
alter table public.collaborations add column if not exists year       text;
alter table public.collaborations add column if not exists photos     text[] not null default '{}';
alter table public.collaborations add column if not exists published  boolean not null default true;

create unique index if not exists collaborations_slug_key on public.collaborations (slug);
create index if not exists collaborations_date_start_idx on public.collaborations (date_start desc);


-- ---------------------------------------------------------------------------
-- 2. the placeholder rows
-- ---------------------------------------------------------------------------

delete from public.collaborations
 where slug is null
   and title in (
     'M.S. University of Baroda',
     'Seoul Olympic Park',
     'Study of Public & Abstract Sculpture',
     'Stone Carving Exchange'
   );


-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
-- The initial schema let anyone read every row (`using (true)`), which was
-- fine for fixed copy. With a published flag, an unpublished row must stay
-- private, as it does for exhibitions.

drop policy if exists "collaborations: public read" on public.collaborations;

create policy "collaborations: public read" on public.collaborations
  for select to anon, authenticated
  using (published);

-- "collaborations: admin write" from the initial schema is unchanged.

commit;
