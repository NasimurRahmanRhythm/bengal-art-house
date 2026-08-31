"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Topbar } from "./AdminShell";
import { ConfirmDelete, Field } from "./ui";
import ImageUpload from "./ImageUpload";
import { useAdmin } from "@/lib/admin/store";
import { initialsFrom, nextPlate, uniqueSlug } from "@/lib/admin/slug";
import type { Artist } from "@/lib/admin/types";

export default function ArtistForm({ artist }: { artist?: Artist }) {
  const router = useRouter();
  const { data, saveArtist, deleteArtist } = useAdmin();
  const isNew = !artist;

  const [name, setName] = useState(artist?.name ?? "");
  // text[] in Postgres; a blank line between paragraphs is a far lighter
  // interaction than a repeatable list of textareas.
  const [bio, setBio] = useState((artist?.bio ?? []).join("\n\n"));
  const [photos, setPhotos] = useState<string[]>(artist?.photos ?? []);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const slug = useMemo(
    () =>
      uniqueSlug(
        name,
        data.artists.map((a) => a.slug),
        artist?.slug,
      ),
    [name, data.artists, artist?.slug],
  );

  const nameError = !name.trim() ? "A name is required." : "";
  const valid = !nameError;

  const worksCount = data.artworks.filter((w) => w.artistId === artist?.id).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || saving) return;
    setSaving(true);

    await saveArtist({
      id: artist?.id ?? "",
      slug,
      name: name.trim(),
      bio: bio
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      photos,
      // Drawn in place of a portrait wherever one is missing.
      initials: initialsFrom(name),
      plate: artist?.plate ?? nextPlate(data.artists.map((a) => a.plate)),
    });
    router.push("/admin/artists");
  }

  return (
    <>
      <Topbar
        title={isNew ? "Add artist" : name || "Unnamed"}
        parent={{ href: "/admin/artists", label: "Artists" }}
        actions={
          !isNew &&
          worksCount === 0 && (
            <ConfirmDelete
              size="md"
              label="Delete artist"
              onConfirm={async () => {
                await deleteArtist(artist.id);
                router.push("/admin/artists");
              }}
            />
          )
        }
      />

      <div className="a-body">
        <form className="a-form" onSubmit={submit} noValidate>
          <section className="a-section">
            <div className="a-grid">
              <Field label="Name" error={touched ? nameError : ""}>
                <input
                  className="a-input"
                  value={name}
                  autoFocus
                  aria-invalid={touched && !!nameError}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ivy Zaman"
                />
              </Field>

              <Field label="Picture" hint="A portrait. The first one is used on their card.">
                <ImageUpload photos={photos} onChange={setPhotos} max={4} />
              </Field>

              <Field
                label="Biography"
                optional
                hint="Leave a blank line between paragraphs — each becomes its own block."
              >
                <textarea
                  className="a-textarea"
                  style={{ minHeight: 200 }}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={"First paragraph…\n\nSecond paragraph…"}
                />
              </Field>
            </div>
          </section>

          <div className="a-formBar">
            <span className="a-hint">
              {isNew
                ? "Not saved yet"
                : worksCount > 0
                  ? `${worksCount} work${worksCount > 1 ? "s" : ""} linked`
                  : "No works linked yet"}
            </span>
            <Link href="/admin/artists" className="a-btn">
              Cancel
            </Link>
            <button type="submit" className="a-btn" data-variant="primary" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Add artist" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
