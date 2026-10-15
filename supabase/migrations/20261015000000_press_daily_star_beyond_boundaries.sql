-- Gallery Hamiduzzaman — first press item: The Daily Star on "Beyond Boundaries"
--
-- Run AFTER 20261008000000_collaborations.sql. Safe to re-run: the row is
-- keyed on its slug and left alone if it already exists, so edits made to it
-- from the admin panel afterwards are never overwritten.
--
-- The write-up is the gallery's own short summary of the coverage, with a
-- link to the full article on The Daily Star — the article itself is theirs
-- and is not reproduced here. The cover is the exhibition poster already in
-- the gallery's own media bucket.
--
-- Check the date: published_at is set to the exhibition's opening day,
-- 1 October 2026. If the article ran on a different day, correct it from
-- the admin panel (Media & Press Release) or here before running.

insert into public.press_releases (
  slug,
  title,
  excerpt,
  cover_url,
  body_html,
  publication,
  author_name,
  published,
  published_at
)
values (
  'daily-star-beyond-boundaries-brings-25-artists-together',
  '‘Beyond Boundaries’ brings 25 artists together to celebrate Bangladesh’s art',
  'The Daily Star covers “Beyond Boundaries: One Continuing Legacy”, the group exhibition at Gallery Hamiduzzaman bringing together 25 artists across generations and disciplines.',
  'https://gsdxdocnbekbnmbffcnz.supabase.co/storage/v1/object/public/media/2026/9a4b5def-6ca4-4263-9d38-892c40c2f609.jpg',
  $html$<p>The Daily Star has covered <strong>Beyond Boundaries: One Continuing Legacy</strong>, the group exhibition at Gallery Hamiduzzaman that brings together 25 artists — established names in Bangladesh’s art scene alongside newer voices — spanning generations, disciplines and individual perspectives.</p>
<p>The article looks at several of the artists on show, among them Bipasha Hayat, whose paintings and mixed-media works use materials such as cardboard, muslin and wire mesh, and Rafiqun Nabi, the painter, printmaker and cartoonist known for his character “Tokai”.</p>
<p>The exhibition runs from 1 October to 1 November 2026 at Gallery Hamiduzzaman, House 2, Lake View, Road 104, Gulshan 2, Dhaka, sponsored by VIP Motors.</p>
<p><a href="https://www.thedailystar.net/culture/entertainment/news/beyond-boundaries-brings-25-artists-together-celebrate-bangladeshs-art-4297846" target="_blank" rel="noopener noreferrer">Read the full article on The Daily Star</a></p>$html$,
  'The Daily Star',
  'The Daily Star',
  true,
  '2026-10-01 10:00:00+06'
)
on conflict (slug) do nothing;
