"use client";

import { uploadImage } from "./actions";

// Picked file → downscaled JPEG → Supabase Storage → public URL.
//
// The resize is not cosmetic. A photograph straight off a camera is 4–6 MB and
// several thousand pixels wide; the site never renders one above ~1600px, so
// uploading the original would cost the gallery bandwidth on every page view
// for detail nobody sees. It also keeps the data-URL fallback below inside
// localStorage's ~5 MB ceiling.

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That file could not be read as a picture."));
    img.src = src;
  });
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("That file could not be read."));
    reader.readAsDataURL(file);
  });
}

/** Downscale a picked image. Returns the original untouched if it is already small. */
async function downscale(file: File): Promise<Blob> {
  const original = await readAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  // JPEG has no alpha, so a transparent PNG would composite onto black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  return blob ?? file;
}

/**
 * Prepare a picked file and store it, returning the URL to save on the row.
 *
 * With a database connected that URL points at the `media` bucket and the
 * picture is on the public site the moment the row is saved. Without one, it
 * falls back to a data URL held in the row itself, so the panel still works on
 * a checkout that has no credentials — that URL is a stand-in, not storage.
 */
export async function storeImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a picture — a JPG, PNG or WebP file.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That picture is too large. Please use one under 20 MB.");
  }

  const blob = await downscale(file);

  const form = new FormData();
  form.append("file", new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
    type: "image/jpeg",
  }));

  const res = await uploadImage(form);
  if (res.ok) return res.url;

  if (res.error === "not-configured") return readAsDataUrl(blob);
  throw new Error(res.error);
}
