import { createClient } from "@supabase/supabase-js";

import { ARTWORKS, type Artwork } from "@/data/artworks";
import {
  ARTISTS,
  COLLABORATIONS,
  EXHIBITIONS,
  GOVERNING_BODY,
  SERVICES,
  WORKS,
  type Artist,
  type Collaboration,
  type Exhibition,
  type GoverningMember,
  type Service,
  type Work,
} from "@/data/gallery";
import { POSTS } from "@/data/posts";
import { PRESS_RELEASES } from "@/data/press";
import type { ContentItem } from "@/lib/content";

// What the public site reads.
//
// The rule, for every content type below: if the database holds even one row,
// the database is the site. Otherwise the placeholder content in src/data/*.ts
// is shown, so a fresh checkout — or a gallery that has not filled anything in
// yet — still renders a complete website instead of empty pages.
//
// Reads go through the anon key, under the same Row Level Security a visitor
// gets, so an unpublished draft can never leak out this way. Writes never
// happen here; those are the admin's server actions.

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type Row = Record<string, unknown>;

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const strs = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/**
 * Run a query and hand back the rows, or null to mean "use the placeholders".
 * Null covers three cases that all want the same answer: no credentials, the
 * query failed (most often a migration that has not been run), and the table
 * is empty.
 */
async function rows(table: string, select: string, order: string, asc = false) {
  const db = publicClient();
  if (!db) return null;
  try {
    const { data, error } = await db
      .from(table)
      .select(select)
      .order(order, { ascending: asc, nullsFirst: false });
    if (error || !data || data.length === 0) return null;
    return data as unknown as Row[];
  } catch {
    return null;
  }
}

export async function getArtworks(): Promise<Artwork[]> {
  const data = await rows("artworks", "*, artists(name)", "created_at");
  if (!data) return ARTWORKS;

  return data.map((r, i) => {
    const artist = (r.artists ?? null) as Row | null;
    const material = str(r.material);
    return {
      id: str(r.slug),
      title: str(r.title),
      artist: str(artist?.name),
      category: str(r.category) as Artwork["category"],
      material,
      medium: material,
      price: Number(r.price ?? 0),
      status: str(r.status) === "sold" ? "sold" : "available",
      plate: Number(r.plate ?? i),
      photo: strs(r.photos)[0],
      year: str(r.year),
      dimensions: str(r.dimensions),
      note: str(r.description),
    } satisfies Artwork;
  });
}

export async function getArtists(): Promise<Artist[]> {
  const data = await rows("artists", "*, artworks(id)", "name", true);
  if (!data) return ARTISTS;

  return data.map((r, i) => {
    const bio = strs(r.bio);
    const count = Array.isArray(r.artworks) ? r.artworks.length : 0;
    return {
      slug: str(r.slug),
      name: str(r.name),
      initials: str(r.initials),
      // The gallery only fills in a name, a picture and a biography, so the
      // card's summary line is the opening of the biography rather than a
      // separate field nobody would remember to write.
      role: "",
      body: bio[0] ?? "",
      bio,
      facts: [],
      works: count === 1 ? "1 work in the gallery" : `${count} works in the gallery`,
      plate: Number(r.plate ?? i),
      photo: strs(r.photos)[0],
    } satisfies Artist;
  });
}

export async function getExhibitions(): Promise<Exhibition[]> {
  const data = await rows("exhibitions", "*", "date_start");
  if (!data) return EXHIBITIONS;

  const today = new Date().toISOString().slice(0, 10);

  return data.map((r, i) => {
    const start = str(r.date_start);
    const end = str(r.date_end) || start;
    // Derived, never stored — a saved status silently goes stale the day a
    // show closes.
    const status: Exhibition["status"] = !start
      ? "past"
      : end < today
        ? "past"
        : start > today
          ? "upcoming"
          : "current";

    return {
      id: str(r.slug),
      year: str(r.year) || start.slice(0, 4),
      date: str(r.date_label),
      title: str(r.title),
      venue: str(r.venue),
      tag: [str(r.ticket_info), str(r.opening_hours)].filter(Boolean).join(" · "),
      status,
      plate: Number(r.plate ?? i),
      blurb: str(r.blurb),
      photo: strs(r.photos)[0],
    } satisfies Exhibition;
  });
}

export async function getGoverningBody(): Promise<GoverningMember[]> {
  const data = await rows("governing_body", "*", "order_index", true);
  if (!data) return GOVERNING_BODY;

  return data.map((r) => ({
    id: str(r.id),
    name: str(r.name),
    role: str(r.role),
    bio: str(r.bio),
    photo: str(r.photo_url) || undefined,
  }));
}

export async function getCollaborations(): Promise<Collaboration[]> {
  const data = await rows("collaborations", "*", "order_index", true);
  if (!data) return COLLABORATIONS;

  return data.map((r) => ({
    place: str(r.place),
    title: str(r.title),
    body: str(r.body),
    years: str(r.years),
  }));
}

export async function getServices(): Promise<Service[]> {
  const data = await rows("services", "*", "order_index", true);
  if (!data) return SERVICES;

  return data.map((r) => ({
    title: str(r.title),
    body: str(r.body),
    icon: str(r.icon) as Service["icon"],
  }));
}

export async function getWorks(): Promise<Work[]> {
  const data = await rows("works", "*", "order_index", true);
  if (!data) return WORKS;

  return data.map((r, i) => ({
    // The numbering is positional, not stored — a work's place in the list is
    // what "03" means, and storing it would let the two drift apart.
    index: String(i + 1).padStart(2, "0"),
    title: str(r.title),
    medium: str(r.medium),
    location: str(r.location),
  }));
}

function toContent(r: Row): ContentItem {
  return {
    slug: str(r.slug),
    title: str(r.title),
    excerpt: str(r.excerpt),
    coverUrl: str(r.cover_url) || null,
    html: str(r.body_html),
    authorName: str(r.author_name),
    publishedAt: str(r.published_at),
  };
}

export async function getPosts(): Promise<ContentItem[]> {
  const data = await rows("posts", "*", "published_at");
  return data ? data.map(toContent) : POSTS;
}

export async function getPressReleases(): Promise<ContentItem[]> {
  const data = await rows("press_releases", "*", "published_at");
  return data ? data.map(toContent) : PRESS_RELEASES;
}
