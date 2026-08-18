# Bengal Art House — project notes

Multi-artist art gallery platform (Next.js 15 App Router, React 19, TypeScript,
GSAP). Structurally modeled on `edgegallery.com.bd`; the visual design is our
own. Hamiduzzaman Khan's content is seed/dummy data, not the site's identity.

See `PLAN.md` for the full redesign plan and the Phase 2 schema + build order.

## Environment

- **Node 22+ required** (`engines` field enforces it). `@supabase/supabase-js`
  hard-crashes on Node 20 — no native WebSocket. Currently developed on v24.
- `.env.local` holds the Supabase keys (gitignored, never commit):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`. `.env.example` documents the shape.
- Verify changes with `npx tsc --noEmit` and `npm run build`.
- npm 11 warns that `sharp` / `unrs-resolver` install scripts are blocked —
  harmless, both resolve via prebuilt binaries. Ignore it.

## Current state (Phase 1 done, Phase 2 in progress)

The site is still **fully static**: every page reads hardcoded arrays from
`src/data/` (`gallery.ts` → artists, works, exhibitions, collaborations,
services; `artworks.ts` → artworks, mediums; `site.ts` → site constants).
There are no API routes and nothing fetches. The cart (`src/context/
CartContext.tsx`) is localStorage-only, and the contact form submits nowhere.

Phase 2 replaces that with Supabase. **Step 1 is complete** — packages
installed and clients written in `src/lib/supabase/`:

| File | Use |
|---|---|
| `client.ts` | browser / client components |
| `server.ts` | server components + server actions (cookie session) |
| `middleware.ts` | `updateSession()` — session refresh, used by route protection |
| `admin.ts` | service_role, **bypasses RLS — server-only, never import client-side** |

Next up: step 2 (schema migration SQL), then auth pages, then migrating
entities off `src/data/` one at a time starting with artists.

## Conventions

- CSS Modules alongside components (`Foo.tsx` + `Foo.module.css`); the
  marble/ink/oxide palette and type scale live in `src/app/globals.css`.
- GSAP animation helpers are in `src/lib/gsap.ts` and `src/lib/motion.ts`;
  reusable motion wrappers in `src/components/motion/`.
- `src/data/` shapes are the reference for the DB schema — but note
  `Artwork.artist` is currently a plain name string, not a foreign key. It
  becomes `artist_id` once the DB lands.
- `gallery-hamiduzzaman-site/` is the original static HTML site, kept only as
  a content source. Don't edit it.
