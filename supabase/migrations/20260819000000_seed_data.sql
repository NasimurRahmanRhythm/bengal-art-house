-- Gallery Hamiduzzaman — seed data
--
-- Run AFTER 20260818000000_init_schema.sql, in the Supabase SQL editor.
-- This is the content currently hardcoded in src/data/*.ts, moved into the
-- database so the public pages can read from Postgres instead.
--
-- Re-running: artists / artworks / exhibitions upsert on their slug, so edits
-- made here are refreshed and nothing duplicates.
--
-- WARNING: services and works have no natural unique key, so
-- they are cleared and reinserted. If those are ever edited through the admin
-- panel, re-running this file DISCARDS those edits. The other three tables are
-- safe to re-run at any time.
--
-- Long strings use dollar quoting ($txt$...$txt$) rather than doubled
-- apostrophes — the bios and notes are full of them and escaping by hand is
-- how a seed file gets silently corrupted.

begin;

-- ---------------------------------------------------------------------------
-- artists
-- ---------------------------------------------------------------------------

insert into public.artists (slug, name, role, initials, body, bio, facts, plate)
values
  (
    'hamiduzzaman-khan',
    'Hamiduzzaman Khan',
    'Founder · Sculptor, 1946–2025',
    'HK',
    $txt$Founding figure of modern sculpture in Bangladesh, working across bronze, stone and steel for five decades.$txt$,
    array[
      $txt$Born in 1946 in Sahasram, Kishoreganj, Hamiduzzaman Khan graduated from Dhaka Art College in 1967 and studied under Shilpacharya Zainul Abedin before earning a master's degree from the M.S. University of Baroda, India, in 1976. A journey through Europe and the United States in the early 1980s exposed him to abstract public sculpture — a language he brought home and made his own.$txt$,
      $txt$Building on the modernist path opened by Novera Ahmed, he became a founding figure of sculpture in Bangladesh, popularising sculpture parks and integrating monumental form into the country's campuses, institutes and public squares. His themes returned again and again to the Liberation War of 1971 and to birds — motifs he carved in granite, marble, bronze, mild steel and stainless steel.$txt$
    ],
    $json$[
      {"label": "Born",        "value": "16 March 1946, Kishoreganj"},
      {"label": "Mentor",      "value": "Zainul Abedin"},
      {"label": "Recognition", "value": "Ekushey Padak, 2006"},
      {"label": "Faculty",     "value": "Fine Arts, Dhaka University"}
    ]$json$::jsonb,
    0
  ),
  (
    'ivy-zaman',
    'Ivy Zaman',
    'Sculptor',
    'IZ',
    $txt$Sculptor in her own right, with works shown in Bangladesh, Korea and India alongside her husband's practice.$txt$,
    array[
      $txt$Ivy Zaman studied sculpture alongside Hamiduzzaman Khan, developing her own practice in marble and granite even as she supported his public commissions. Where his work reached for monumental, public scale, hers has stayed closer to the studio — compact seated and reclining forms carved directly from stone, finished by hand.$txt$,
      $txt$Her work has been shown in Bangladesh, South Korea and India. She continues to carve from the family studio in Dhaka, and has taken an increasing role in advising the gallery's collectors on stone and marble acquisitions.$txt$
    ],
    $json$[
      {"label": "Practice",  "value": "Marble & granite, direct carving"},
      {"label": "Based in",  "value": "Dhaka, Bangladesh"},
      {"label": "Exhibited", "value": "Bangladesh, South Korea, India"},
      {"label": "Role",      "value": "Sculptor & advisory"}
    ]$json$::jsonb,
    4
  ),
  (
    'zubair-khan',
    'Zubair Khan',
    'Studio & Archive',
    'ZK',
    $txt$Continuing the documentation and stewardship of his father's public works, alongside his own studio practice.$txt$,
    array[
      $txt$Zubair Khan grew up around his father's studio and, together with his brother Zarif, now leads the work of cataloguing, conserving and exhibiting Hamiduzzaman Khan's public sculptures — the archive that underpins the gallery's authentication and restoration services.$txt$,
      $txt$His own practice extends the studio's material language into smaller, contemporary bronze forms, often finished in the same green patina used across the sculpture park's outdoor works.$txt$
    ],
    $json$[
      {"label": "Practice", "value": "Bronze, cast on granite"},
      {"label": "Based in", "value": "Dhaka, Bangladesh"},
      {"label": "Focus",    "value": "Documentation & conservation"},
      {"label": "Role",     "value": "Studio & archive"}
    ]$json$::jsonb,
    8
  )
on conflict (slug) do update set
  name     = excluded.name,
  role     = excluded.role,
  initials = excluded.initials,
  body     = excluded.body,
  bio      = excluded.bio,
  facts    = excluded.facts,
  plate    = excluded.plate;


-- ---------------------------------------------------------------------------
-- artworks
--
-- artist_id is resolved from the artist slug, so this file never hardcodes a
-- uuid and stays runnable against a fresh database.
-- ---------------------------------------------------------------------------

insert into public.artworks
  (slug, artist_id, title, art_group, medium, price, status, photo_url, year, dimensions, note, plate)
values
  ('untitled-abstract-form',
   (select id from public.artists where slug = 'hamiduzzaman-khan'),
   'Untitled Abstract Form', 'steel', 'Painted wood & steel, studio edition',
   180000, 'available', '/images/sculpture.jpg', 'c. 1998', '62 × 21 × 18 cm',
   $txt$A studio-scale study in the standing form — the silhouette he returned to across four decades of public work.$txt$, 0),

  ('bird-study-ii',
   (select id from public.artists where slug = 'hamiduzzaman-khan'),
   'Bird Study II', 'bronze', 'Bronze, small edition',
   250000, 'available', null, '2004', '44 × 38 × 16 cm',
   $txt$Birds ran through his practice as a motif of release. Cast in bronze from a mild steel maquette.$txt$, 1),

  ('riverline-watercolour',
   (select id from public.artists where slug = 'hamiduzzaman-khan'),
   'Riverline (Watercolour Series)', 'paper', 'Watercolour on paper, framed',
   65000, 'available', null, '1991', '38 × 56 cm, framed',
   $txt$From the riverine watercolours made on travel through Kishoreganj — sculpture rehearsed on paper.$txt$, 2),

  ('black-granite-form',
   (select id from public.artists where slug = 'hamiduzzaman-khan'),
   'Black Granite Form', 'stone', 'Black granite, single eye motif',
   320000, 'sold', null, '1986', '51 × 30 × 30 cm',
   $txt$Carved from a single block, pierced by the eye motif that recurs across his granite work.$txt$, 3),

  ('seated-form',
   (select id from public.artists where slug = 'ivy-zaman'),
   'Seated Form', 'stone', 'Marble di Carrara, small scale',
   210000, 'available', null, '2009', '34 × 26 × 22 cm',
   $txt$A compact seated figure in Carrara marble, polished to a soft shoulder line.$txt$, 4),

  ('sketch-for-shangshaptok',
   (select id from public.artists where slug = 'hamiduzzaman-khan'),
   'Sketch for Shangshaptok', 'paper', 'Graphite & ink on paper, archival',
   95000, 'available', null, '1988', '42 × 30 cm',
   $txt$A working drawing for the Jahangirnagar University monument — the structure resolved before the pour.$txt$, 5),

  ('wing-fragment',
   (select id from public.artists where slug = 'hamiduzzaman-khan'),
   'Wing Fragment', 'steel', 'Mild steel, welded plate',
   145000, 'available', null, '2013', '58 × 40 × 24 cm',
   $txt$Welded from cut plate and left to weather — the rust surface was intended, not neglected.$txt$, 6),

  ('steps-maquette',
   (select id from public.artists where slug = 'hamiduzzaman-khan'),
   'Steps (Maquette)', 'stone', $txt$Cast stone, artist's maquette$txt$,
   275000, 'sold', null, '1987', '40 × 40 × 28 cm',
   $txt$The working model for the stone work installed permanently at Seoul Olympic Park in 1988.$txt$, 7),

  ('study-in-patina',
   (select id from public.artists where slug = 'zubair-khan'),
   'Study in Patina', 'bronze', 'Bronze on granite base',
   118000, 'available', null, '2021', '29 × 18 × 18 cm',
   $txt$From the studio's continuing practice — a small bronze finished in the green patina of the park works.$txt$, 8)
on conflict (slug) do update set
  artist_id  = excluded.artist_id,
  title      = excluded.title,
  art_group  = excluded.art_group,
  medium     = excluded.medium,
  price      = excluded.price,
  status     = excluded.status,
  photo_url  = excluded.photo_url,
  year       = excluded.year,
  dimensions = excluded.dimensions,
  note       = excluded.note,
  plate      = excluded.plate;


-- ---------------------------------------------------------------------------
-- exhibitions
--
-- Two of these are known only by year, so date_start/date_end stay null and
-- `year` carries the ordering. Anything deriving current/upcoming/past should
-- treat a null date_start as archive and fall back to `year` for sorting —
-- inventing a 1 January date would fake precision the source doesn't have.
-- ---------------------------------------------------------------------------

insert into public.exhibitions
  (slug, title, venue, date_start, date_end, date_label, year, tag, blurb, plate)
values
  ('retrospective',
   'Hamiduzzaman Khan Retrospective',
   'Nalinikanta Bhattashali Gallery, Bangladesh National Museum',
   date '2025-08-14', date '2025-09-04',
   '14 August — 4 September 2025', '2025', 'Sculpture · Painting · Print',
   $txt$Five decades gathered in one room — the maquettes, the drawings, and the prints that stood behind the monuments.$txt$, 1),

  ('artistic-journey',
   'An Artistic Journey',
   'Bengal Shilpalay, Dhanmondi, Dhaka',
   date '2025-09-12', date '2025-10-03',
   '12 September — 3 October 2025', '2025', 'Sculpture & Sketches',
   $txt$Sculpture shown alongside the sketchbooks, tracing how a line on paper becomes a form in steel.$txt$, 6),

  ('birth-anniversary',
   '70th Birth Anniversary Exhibition',
   'Galleri Kaya, Dhaka',
   date '2016-12-21', date '2016-12-21',
   '21 December 2016', '2016', 'Solo Sculpture',
   $txt$A solo survey mounted for his seventieth year, drawn largely from the artist's own collection.$txt$, 3),

  ('first-national',
   'First National Sculpture Exhibition',
   'Bangladesh Shilpakala Academy — Best Award',
   null, null,
   '1976', '1976', 'Group · Award',
   $txt$The exhibition that announced sculpture as a national practice — and took the Best Award home.$txt$, 7),

  ('riverine',
   'Riverine: Watercolours',
   'Shilpakala Academy, Dhaka',
   null, null,
   '1991', '1991', 'Works on Paper',
   $txt$The watercolours made on the rivers of Kishoreganj, shown together for the first and only time.$txt$, 2)
on conflict (slug) do update set
  title      = excluded.title,
  venue      = excluded.venue,
  date_start = excluded.date_start,
  date_end   = excluded.date_end,
  date_label = excluded.date_label,
  year       = excluded.year,
  tag        = excluded.tag,
  blurb      = excluded.blurb,
  plate      = excluded.plate;


-- ---------------------------------------------------------------------------
-- services / works
--
-- No natural unique key on these two, so they are replaced wholesale.
-- See the warning at the top of this file.
-- ---------------------------------------------------------------------------

-- Collaborations are no longer seeded: since 20261008000000_collaborations.sql
-- they are real content, managed from the admin panel, and a re-run of this
-- file must not wipe them.

delete from public.services;
insert into public.services (title, body, icon, order_index)
values
  ('Art Advisory',
   $txt$Guidance for patrons and institutions collecting or investing in sculpture and works on paper.$txt$,
   'advisory', 1),
  ('Cataloging & Documentation',
   $txt$High-quality imaging, titling and archival records for public and private collections of his work.$txt$,
   'catalog', 2),
  ('Restoration & Conservation',
   $txt$Care for stone, bronze and steel works exposed to years of open-air installation and weather.$txt$,
   'restore', 3),
  ('Provenance & Authentication',
   $txt$Verification support for works attributed to the artist, addressing a real concern across the region.$txt$,
   'provenance', 4),
  ('Public Art Consultation',
   $txt$Advice for institutions and campuses commissioning or siting monumental sculpture in public space.$txt$,
   'public', 5),
  ('Valuation',
   $txt$Assessment of current market valuation for sculpture and works on paper, with a written report.$txt$,
   'valuation', 6);

delete from public.works;
insert into public.works (title, medium, location, order_index)
values
  ('Shangshaptok', 'Concrete & steel',
   'Jahangirnagar University — spirit of the Liberation War', 1),
  ($txt$Remembrance '71$txt$, 'Bronze',
   'First cast 1976 — reworked across three decades', 2),
  ('Steps', 'Stone, abstract form',
   'Seoul Olympic Park, South Korea — 1988', 3),
  ('Shantir Payra (Peace Bird)', 'Stainless steel',
   'TSC, University of Dhaka', 4),
  ('Jagroto Bangla', 'Mixed metal', 'Brahmanbaria', 5),
  ('Waiting Mother', 'Rusted mild steel',
   $txt$A mother awaiting her son's return from 1971$txt$, 6),
  ('Mukta Bangla', 'Stainless steel — 2011',
   'Patuakhali Science & Technology University', 7),
  ('Freedom', 'Stone', 'Krishibid Institute, Dhaka', 8),
  ('Flying Bird', 'Steel', 'World Bank Dhaka Office', 9);

commit;


-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
--
--   select 'artists' t, count(*) from public.artists
--   union all select 'artworks',       count(*) from public.artworks
--   union all select 'exhibitions',    count(*) from public.exhibitions
--   union all select 'collaborations', count(*) from public.collaborations
--   union all select 'services',       count(*) from public.services
--   union all select 'works',          count(*) from public.works;
--
-- Expected: 3, 9, 5, 4, 6, 9.
