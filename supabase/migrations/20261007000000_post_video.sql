-- Gallery Hamiduzzaman — an optional video on a blog post
--
-- Run AFTER 20261006000000_refunds.sql. Safe to re-run.
--
-- The video file itself lives in Storage, in a bucket of its own; the post
-- row only holds its public URL, the same way cover_url does for pictures.
-- Keeping the bytes out of Postgres keeps the posts table small and lets the
-- video be served from the storage CDN.
--
-- The admin panel re-encodes every video in the browser before uploading
-- (H.264 MP4 at most 1920px on the long side, ~8 Mbps for 1080p), so what
-- lands here is usually well under half the original while still looking
-- like it. The bucket limits below are the backstop.

begin;

-- ---------------------------------------------------------------------------
-- 1. posts — the video's address
-- ---------------------------------------------------------------------------

alter table public.posts add column if not exists video_url text;


-- ---------------------------------------------------------------------------
-- 2. the `videos` bucket
-- ---------------------------------------------------------------------------
-- Separate from `media`: that bucket only takes pictures, up to 20 MB, and
-- loosening it would let a video slip into a picture field.
--
-- 45 MB matches the limit the admin panel enforces. MP4 and WebM only — the
-- two every browser plays — so an uncompressed iPhone .mov can never be
-- published to a page where Chrome would show a broken player.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  47185920,  -- 45 MB
  array['video/mp4', 'video/webm']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "videos: public read" on storage.objects;

create policy "videos: public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'videos');

-- No insert policy on purpose. Uploads only happen through a signed upload
-- URL, which the server hands out after checking the caller is an admin.

commit;
