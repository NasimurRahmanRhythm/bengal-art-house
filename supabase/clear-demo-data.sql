-- Gallery Hamiduzzaman — empty the demo content out of the database
--
-- NOT a migration. Nothing runs this for you; paste it into the Supabase SQL
-- editor when the gallery is ready to put its own content in, and the site
-- starts from nothing instead of from someone else's placeholder sculptures.
--
-- ============================ READ THIS FIRST ============================
-- This deletes rows, and there is no undo. It removes EVERY artwork, artist,
-- exhibition, collaboration, service, public work, blog post, press item and
-- enquiry — including anything the gallery has already added by hand, and
-- including the pictures those rows point at.
--
-- Uploaded picture FILES are not touched. They stay in the `media` storage
-- bucket, unreferenced. Clearing those is a separate job (Storage → media in
-- the dashboard) and is deliberately not automated here: a delete that reaches
-- into file storage is a bad thing to run by accident.
-- ========================================================================
--
-- What is deliberately KEPT:
--
--   orders, order_items   Real money and real receipts, or the shape they will
--                         arrive in. Empty today; the SSLCommerz work is still
--                         to come and this table is what it lands in.
--   profiles              Customer and admin accounts.
--   admin_allowlist       Who can sign in. Wiping this locks you out.
--   governing_body        Never had demo rows; only what you entered.
--
-- After running this the public site does NOT go blank. Every page falls back
-- to the placeholder content in src/data/*.ts whenever its table is empty —
-- see src/lib/site-data.ts — so the site stays whole while the gallery fills
-- it in one section at a time. A section switches over to real content the
-- moment it has one row.

begin;

-- Order matters: order_items references artworks with ON DELETE RESTRICT, and
-- enquiries reference artworks too. Both are empty in a clean install; this
-- fails loudly rather than silently if they are not, which is the right
-- outcome — an artwork somebody has actually bought should not vanish.
delete from public.enquiries;

delete from public.artworks;
delete from public.artists;
delete from public.exhibitions;
-- collaborations: not demo content any more — managed from the admin panel.
delete from public.services;
delete from public.works;
delete from public.posts;
delete from public.press_releases;

commit;


-- Check what is left:
--
--   select 'artists' as t, count(*) from public.artists
--   union all select 'artworks',       count(*) from public.artworks
--   union all select 'exhibitions',    count(*) from public.exhibitions
--   union all select 'collaborations', count(*) from public.collaborations
--   union all select 'services',       count(*) from public.services
--   union all select 'works',          count(*) from public.works
--   union all select 'posts',          count(*) from public.posts
--   union all select 'press_releases', count(*) from public.press_releases
--   union all select 'governing_body', count(*) from public.governing_body
--   union all select 'orders',         count(*) from public.orders;
