-- Gallery Hamiduzzaman — artwork category, year and dimensions
--
-- Run after 20260830000000_admin_content.sql. Safe to re-run.
--
-- `category` is the one field on an artwork with a fixed list behind it. That
-- is deliberate, and the opposite of `material`: material is how the gallery
-- describes a piece in its own words, category is how a visitor narrows the
-- shelf down, so it has to mean the same thing on every row. Four values, and
-- adding a fifth is a migration — which is the point.

alter table public.artworks add column if not exists category text;

-- year and dimensions already exist from the initial schema; both stay text.
-- A year is sometimes "c. 1998" and a dimension is always three numbers and a
-- unit, so neither is arithmetic the database should be doing.

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.artworks'::regclass
      and conname  = 'artworks_category_check'
  ) then
    alter table public.artworks drop constraint artworks_category_check;
  end if;
end;
$$;

-- Existing rows are guessed from the material they were migrated with, then
-- the column is locked to the four values. Anything unrecognised becomes
-- Sculpture: it is what the gallery mostly holds, and a wrong guess is one
-- dropdown away from being fixed.
update public.artworks
   set category = case
     when lower(coalesce(material, '') || ' ' || coalesce(medium, '')) ~ 'watercolour|graphite|ink|paper|drawing|print'
       then 'Paintings'
     when lower(coalesce(material, '') || ' ' || coalesce(medium, '')) ~ 'calligraph'
       then 'Calligraphy'
     when lower(coalesce(material, '') || ' ' || coalesce(medium, '')) ~ 'installation'
       then 'Installation'
     else 'Sculpture'
   end
 where category is null;

alter table public.artworks
  add constraint artworks_category_check
  check (category is null or category in
         ('Calligraphy', 'Installation', 'Paintings', 'Sculpture'));

create index if not exists artworks_category_idx on public.artworks (category);
