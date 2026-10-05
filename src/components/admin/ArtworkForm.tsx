"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Topbar } from "./AdminShell";
import { ConfirmDelete, Field, Segmented } from "./ui";
import ImageUpload from "./ImageUpload";
import { useAdmin } from "@/lib/admin/store";
import { formatBDT, nextPlate, uniqueSlug } from "@/lib/admin/slug";
import {
  CATEGORIES,
  YEAR_MAX,
  YEAR_MIN,
  type Artwork,
  type ArtworkStatus,
  type Category,
} from "@/lib/admin/types";

const STATUSES: { value: ArtworkStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

export default function ArtworkForm({ artwork }: { artwork?: Artwork }) {
  const router = useRouter();
  const { data, saveArtwork, deleteArtwork } = useAdmin();
  const isNew = !artwork;

  const [title, setTitle] = useState(artwork?.title ?? "");
  const [artistId, setArtistId] = useState(artwork?.artistId ?? data.artists[0]?.id ?? "");
  const [description, setDescription] = useState(artwork?.description ?? "");
  const [material, setMaterial] = useState(artwork?.material ?? "");
  const [category, setCategory] = useState<Category>(artwork?.category || "Sculpture");
  const [year, setYear] = useState(artwork?.year ?? "");
  const [dimensions, setDimensions] = useState(artwork?.dimensions ?? "");
  const [photos, setPhotos] = useState<string[]>(artwork?.photos ?? []);
  // No price is stored as 0, and shown here as an empty box rather than "0".
  const [price, setPrice] = useState(artwork?.price ? String(artwork.price) : "");
  const [status, setStatus] = useState<ArtworkStatus>(artwork?.status ?? "available");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // The web address is generated from the title and never shown — one fewer
  // box, and nothing on the site links to an artwork by anything else.
  const slug = useMemo(
    () =>
      uniqueSlug(
        title,
        data.artworks.map((w) => w.slug),
        artwork?.slug,
      ),
    [title, data.artworks, artwork?.slug],
  );

  const priceNum = Number(price.replace(/[^0-9.]/g, ""));
  // Optional, but a typo in it is silent — "199" or "20265" would sit on the
  // card looking almost right — so it is checked whenever something is there.
  const yearNum = Number(year.trim());
  const errors = {
    title: !title.trim() ? "A title is required." : "",
    artistId: !artistId ? "Pick the artist." : "",
    // Left empty, the piece is shown as "Price on request" and cannot be
    // bought online.
    price: price.trim() && (Number.isNaN(priceNum) || priceNum < 0) ? "Enter a number." : "",
    year:
      !year.trim() || (Number.isInteger(yearNum) && yearNum >= YEAR_MIN && yearNum <= YEAR_MAX)
        ? ""
        : `Enter a year between ${YEAR_MIN} and ${YEAR_MAX}.`,
  };
  const valid = !errors.title && !errors.artistId && !errors.price && !errors.year;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || saving) return;
    setSaving(true);

    // An empty id means "new" — Postgres assigns the real one on insert.
    await saveArtwork({
      id: artwork?.id ?? "",
      slug,
      artistId,
      title: title.trim(),
      description: description.trim(),
      material: material.trim(),
      category,
      year: year.trim(),
      dimensions: dimensions.trim(),
      photos,
      price: priceNum,
      status,
      plate: artwork?.plate ?? nextPlate(data.artworks.map((w) => w.plate)),
    });
    router.push("/admin/artworks");
  }

  return (
    <>
      <Topbar
        title={isNew ? "Add artwork" : title || "Untitled"}
        parent={{ href: "/admin/artworks", label: "Artworks" }}
        actions={
          !isNew && (
            <ConfirmDelete
              size="md"
              label="Delete artwork"
              onConfirm={() => {
                deleteArtwork(artwork.id);
                router.push("/admin/artworks");
              }}
            />
          )
        }
      />

      <div className="a-body">
        <form className="a-form" onSubmit={submit} noValidate>
          <section className="a-section">
            <div className="a-grid">
              <Field label="Name" error={touched ? errors.title : ""}>
                <input
                  className="a-input"
                  value={title}
                  autoFocus
                  aria-invalid={touched && !!errors.title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bird Study II"
                />
              </Field>

              <Field label="Description" optional>
                <textarea
                  className="a-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Birds ran through his practice as a motif of release…"
                />
              </Field>

              <Field label="Pictures" hint="The first one is shown on the artwork card.">
                <ImageUpload photos={photos} onChange={setPhotos} />
              </Field>

              <Field label="Category" hint="What visitors filter the artworks page by.">
                <Segmented value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />
              </Field>

              <Field label="Material" optional hint="In your own words.">
                <input
                  className="a-input"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Bronze on granite base"
                />
              </Field>

              <div className="a-grid" data-cols="2">
                <Field label="Year" optional error={touched ? errors.year : ""}>
                  <input
                    className="a-input"
                    inputMode="numeric"
                    maxLength={4}
                    value={year}
                    aria-invalid={touched && !!errors.year}
                    onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
                    placeholder="2004"
                  />
                </Field>

                <Field label="Dimensions" optional>
                  <input
                    className="a-input"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="44 × 38 × 16 cm"
                  />
                </Field>
              </div>

              <div className="a-grid" data-cols="2">
                <Field
                  label="Price"
                  optional
                  error={touched ? errors.price : ""}
                  hint={priceNum > 0 ? formatBDT(priceNum) : "Leave empty for “Price on request”"}
                >
                  <div className="a-prefixed">
                    <span className="a-prefix">BDT</span>
                    <input
                      className="a-input"
                      inputMode="numeric"
                      value={price}
                      aria-invalid={touched && !!errors.price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="180000"
                    />
                  </div>
                </Field>

                <Field label="Artist" error={touched ? errors.artistId : ""}>
                  <select
                    className="a-select"
                    value={artistId}
                    onChange={(e) => setArtistId(e.target.value)}
                  >
                    {data.artists.length === 0 && <option value="">No artists yet</option>}
                    {data.artists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Status">
                <Segmented value={status} options={STATUSES} onChange={setStatus} />
              </Field>
            </div>
          </section>

          <div className="a-formBar">
            <span className="a-hint">
              {isNew ? "Not saved yet" : "Editing an existing piece"}
              {!valid && touched && " · check the highlighted fields"}
            </span>
            <Link href="/admin/artworks" className="a-btn">
              Cancel
            </Link>
            <button type="submit" className="a-btn" data-variant="primary" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Add artwork" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
