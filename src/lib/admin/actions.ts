"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  dbConfigured,
  fetchAll,
  rowToArtist,
  rowToArtwork,
  rowToExhibition,
  rowToMember,
  rowToPost,
  rowToRelease,
} from "./db";
import type {
  AdminData,
  Artist,
  Artwork,
  BlogPost,
  Enquiry,
  Exhibition,
  GoverningMember,
  Order,
  PressRelease,
} from "./types";

// Every write in the dashboard goes through this file.
//
// It runs with the service_role key, not the visitor's session, because the
// admin panel has no login yet and the RLS policies on these tables all require
// is_admin(). That is safe only while the panel itself is unreachable in
// production — the gate lives in src/app/admin/layout.tsx, and this file must
// not be imported from anywhere outside /admin. When /admin/login lands, swap
// createAdminClient() for the session client here and RLS enforces the rest.

function db() {
  if (!dbConfigured()) {
    throw new Error(
      "No database connection. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    );
  }
  return createAdminClient();
}

/** Refresh the public pages that render whatever just changed. */
function revalidatePublic(paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

export async function loadAll(): Promise<
  { ok: true; data: AdminData; warning: string } | { ok: false; error: string }
> {
  if (!dbConfigured()) return { ok: false, error: "not-configured" };
  try {
    const { data, failed } = await fetchAll();
    return {
      ok: true,
      data,
      warning: failed.length
        ? `${failed.join(", ")} could not be read — run the latest migration in the Supabase SQL editor.`
        : "",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not reach the database." };
  }
}

// --- pictures --------------------------------------------------------------

/**
 * Upload one picture to the `media` bucket and return its public URL.
 *
 * Takes FormData rather than a base64 string so the file streams through as
 * bytes; a data URL would inflate it by a third and has to be parsed twice.
 */
export async function uploadImage(
  form: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  // Signalled rather than thrown: the caller falls back to keeping the picture
  // on the row itself so the panel still works without credentials.
  if (!dbConfigured()) return { ok: false, error: "not-configured" };

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file was received." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "That file is not a picture." };
  }

  try {
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    // Random name, not the original: two people uploading DSC_0001.jpg must not
    // overwrite each other, and the filename is never shown to anyone.
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext || "jpg"}`;

    const { error } = await db()
      .storage.from("media")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

    if (error) {
      // The most common failure by far, and the one with a fix the user can act on.
      const missing = /bucket not found/i.test(error.message);
      return {
        ok: false,
        error: missing
          ? "The 'media' storage bucket does not exist yet — run the latest migration."
          : error.message,
      };
    }

    const { data } = db().storage.from("media").getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed." };
  }
}

// --- artists ---------------------------------------------------------------

export async function saveArtist(a: Artist): Promise<Artist> {
  const row = {
    slug: a.slug,
    name: a.name,
    bio: a.bio,
    photos: a.photos,
    photo_url: a.photos[0] ?? null, // kept in step for anything still reading it
    initials: a.initials,
    plate: a.plate,
    published: true,
  };

  const q = db().from("artists");
  const { data, error } = a.id
    ? await q.update(row).eq("id", a.id).select().single()
    : await q.insert(row).select().single();

  if (error) throw new Error(error.message);
  revalidatePublic(["/", "/artists", `/artists/${a.slug}`]);
  return rowToArtist(data);
}

export async function deleteArtist(id: string): Promise<void> {
  const { error } = await db().from("artists").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublic(["/", "/artists"]);
}

// --- artworks --------------------------------------------------------------

export async function saveArtwork(w: Artwork): Promise<Artwork> {
  const row = {
    slug: w.slug,
    artist_id: w.artistId,
    title: w.title,
    description: w.description,
    material: w.material,
    // Empty means "not chosen"; the column's check constraint allows null but
    // not an empty string.
    category: w.category || null,
    year: w.year,
    dimensions: w.dimensions,
    price: w.price,
    status: w.status,
    photos: w.photos,
    photo_url: w.photos[0] ?? null,
    plate: w.plate,
    published: true,
  };

  const q = db().from("artworks");
  const { data, error } = w.id
    ? await q.update(row).eq("id", w.id).select().single()
    : await q.insert(row).select().single();

  if (error) throw new Error(error.message);
  revalidatePublic(["/", "/artworks"]);
  return rowToArtwork(data);
}

export async function deleteArtwork(id: string): Promise<void> {
  const { error } = await db().from("artworks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublic(["/", "/artworks"]);
}

export async function setArtworkStatus(id: string, status: Artwork["status"]): Promise<void> {
  const { error } = await db().from("artworks").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublic(["/", "/artworks"]);
}

// --- exhibitions -----------------------------------------------------------

export async function saveExhibition(e: Exhibition): Promise<Exhibition> {
  const row = {
    slug: e.slug,
    title: e.title,
    venue: e.venue,
    date_start: e.dateStart,
    date_end: e.dateEnd,
    date_label: e.dateLabel,
    year: e.year,
    ticket_info: e.ticketInfo,
    opening_hours: e.openingHours,
    blurb: e.blurb,
    photos: e.photos,
    plate: e.plate,
    published: true,
  };

  const q = db().from("exhibitions");
  const { data, error } = e.id
    ? await q.update(row).eq("id", e.id).select().single()
    : await q.insert(row).select().single();

  if (error) throw new Error(error.message);
  revalidatePublic(["/", "/exhibitions"]);
  revalidatePath("/exhibitions/[slug]", "page");
  return rowToExhibition(data);
}

export async function deleteExhibition(id: string): Promise<void> {
  const { error } = await db().from("exhibitions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublic(["/", "/exhibitions"]);
  revalidatePath("/exhibitions/[slug]", "page");
}

// --- governing body --------------------------------------------------------

export async function saveMember(m: GoverningMember): Promise<GoverningMember> {
  const row = {
    name: m.name,
    role: m.role,
    bio: m.bio,
    photo_url: m.photos[0] ?? null,
    order_index: m.orderIndex,
    published: true,
  };

  const q = db().from("governing_body");
  const { data, error } = m.id
    ? await q.update(row).eq("id", m.id).select().single()
    : await q.insert(row).select().single();

  if (error) throw new Error(error.message);
  revalidatePublic(["/", "/governing-body"]);
  return rowToMember(data);
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await db().from("governing_body").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublic(["/", "/governing-body"]);
}

// --- enquiries and orders --------------------------------------------------
// Neither is authored here; the site writes them. Only their status moves.

export async function setEnquiryStatus(id: string, status: Enquiry["status"]): Promise<void> {
  const { error } = await db().from("enquiries").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteEnquiry(id: string): Promise<void> {
  const { error } = await db().from("enquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setPaymentStatus(id: string, s: Order["paymentStatus"]): Promise<void> {
  const { error } = await db().from("orders").update({ payment_status: s }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setFulfillmentStatus(
  id: string,
  s: Order["fulfillmentStatus"],
): Promise<void> {
  const { error } = await db().from("orders").update({ fulfillment_status: s }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await db().from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// --- blog and press --------------------------------------------------------
// One shape, two tables. published_at is stamped the first time a piece goes
// live and left alone afterwards, so editing an old post does not shuffle it
// back to the top of the list.

function writingRow(p: BlogPost | PressRelease) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover_url: p.coverUrl,
    body_html: p.html,
    tag: p.tag,
    author_name: p.authorName,
    published: p.published,
    published_at: p.published ? (p.publishedAt ?? new Date().toISOString()) : null,
  };
}

export async function savePost(p: BlogPost): Promise<BlogPost> {
  const q = db().from("posts");
  const { data, error } = p.id
    ? await q.update(writingRow(p)).eq("id", p.id).select().single()
    : await q.insert(writingRow(p)).select().single();

  if (error) throw new Error(error.message);
  revalidatePublic(["/blog", `/blog/${p.slug}`]);
  return rowToPost(data);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await db().from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublic(["/blog"]);
}

export async function saveRelease(p: PressRelease): Promise<PressRelease> {
  const row = { ...writingRow(p), publication: p.publication };
  const q = db().from("press_releases");
  const { data, error } = p.id
    ? await q.update(row).eq("id", p.id).select().single()
    : await q.insert(row).select().single();

  if (error) throw new Error(error.message);
  revalidatePublic(["/press", `/press/${p.slug}`]);
  return rowToRelease(data);
}

export async function deleteRelease(id: string): Promise<void> {
  const { error } = await db().from("press_releases").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePublic(["/press"]);
}
