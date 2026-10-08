"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Topbar } from "./AdminShell";
import { ConfirmDelete, Field, Segmented } from "./ui";
import ImageUpload from "./ImageUpload";
import { useAdmin } from "@/lib/admin/store";
import { uniqueSlug } from "@/lib/admin/slug";
import { formatRange } from "@/lib/admin/dates";
import type { Collaboration } from "@/lib/admin/types";

/* The same date handling as exhibitions — exact dates when they are known,
   a year when only that survives — because many partner projects are years
   old and their exact dates are not on record. */

export default function CollaborationForm({ collaboration }: { collaboration?: Collaboration }) {
  const router = useRouter();
  const { data, saveCollaboration, deleteCollaboration } = useAdmin();
  const isNew = !collaboration;

  const [title, setTitle] = useState(collaboration?.title ?? "");
  const [subtitle, setSubtitle] = useState(collaboration?.subtitle ?? "");
  const [artists, setArtists] = useState(collaboration?.artists ?? "");
  const [place, setPlace] = useState(collaboration?.place ?? "");
  const [precision, setPrecision] = useState<"exact" | "year">(
    collaboration && !collaboration.dateStart ? "year" : "exact",
  );
  const [dateStart, setDateStart] = useState(collaboration?.dateStart ?? "");
  const [dateEnd, setDateEnd] = useState(collaboration?.dateEnd ?? "");
  const [yearOnly, setYearOnly] = useState(collaboration?.year ?? "");
  const [body, setBody] = useState(collaboration?.body ?? "");
  const [photos, setPhotos] = useState<string[]>(collaboration?.photos ?? []);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const slug = useMemo(
    () =>
      uniqueSlug(
        title,
        data.collaborations.map((c) => c.slug),
        collaboration?.slug,
      ),
    [title, data.collaborations, collaboration?.slug],
  );

  const resolved = useMemo(() => {
    if (precision === "year") {
      return { start: null, end: null, year: yearOnly.trim(), label: yearOnly.trim() };
    }
    return {
      start: dateStart || null,
      end: dateEnd || dateStart || null,
      year: dateStart ? dateStart.slice(0, 4) : "",
      label: formatRange(dateStart, dateEnd),
    };
  }, [precision, dateStart, dateEnd, yearOnly]);

  const errors = {
    title: !title.trim() ? "A title is required." : "",
    dates:
      precision === "exact"
        ? !dateStart
          ? "Pick the start date."
          : dateEnd && dateEnd < dateStart
            ? "The end date is before the start date."
            : ""
        : !/^\d{4}$/.test(yearOnly.trim())
          ? "Enter a four-digit year."
          : "",
  };
  const valid = !errors.title && !errors.dates;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || saving) return;
    setSaving(true);

    await saveCollaboration({
      id: collaboration?.id ?? "",
      slug,
      title: title.trim(),
      subtitle: subtitle.trim(),
      artists: artists.trim(),
      place: place.trim(),
      dateStart: resolved.start,
      dateEnd: resolved.end,
      dateLabel: resolved.label,
      year: resolved.year,
      body: body.trim(),
      photos,
    });
    router.push("/admin/collaborations");
  }

  return (
    <>
      <Topbar
        title={isNew ? "Add collaboration" : title || "Untitled"}
        parent={{ href: "/admin/collaborations", label: "Collaborations" }}
        actions={
          !isNew && (
            <ConfirmDelete
              size="md"
              label="Delete collaboration"
              onConfirm={async () => {
                await deleteCollaboration(collaboration.id);
                router.push("/admin/collaborations");
              }}
            />
          )
        }
      />

      <div className="a-body">
        <form className="a-form" onSubmit={submit} noValidate>
          <section className="a-section">
            <div className="a-grid">
              <Field label="Title" error={touched ? errors.title : ""}>
                <input
                  className="a-input"
                  value={title}
                  autoFocus
                  aria-invalid={touched && !!errors.title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mind The Earth"
                />
              </Field>

              <Field label="Subtitle" optional hint="One line under the title.">
                <input
                  className="a-input"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="A solo art exhibition"
                />
              </Field>

              <div className="a-grid" data-cols="2">
                <Field label="Artists" optional hint="As it should read on the page.">
                  <input
                    className="a-input"
                    value={artists}
                    onChange={(e) => setArtists(e.target.value)}
                    placeholder="Various artists"
                  />
                </Field>

                <Field label="Location" optional>
                  <input
                    className="a-input"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="Gulshan, Dhaka"
                  />
                </Field>
              </div>

              <Field
                label="Pictures"
                optional
                hint="The first picture is shown on the Collaborations page; the rest on its own page."
              >
                <ImageUpload photos={photos} onChange={setPhotos} />
              </Field>
            </div>
          </section>

          <section className="a-section">
            <div className="a-sectionHead">
              <h2 className="a-sectionTitle">When</h2>
            </div>

            <div className="a-grid">
              <Field label="How much is known">
                <Segmented
                  value={precision}
                  options={[
                    { value: "exact", label: "Exact dates" },
                    { value: "year", label: "Year only" },
                  ]}
                  onChange={setPrecision}
                />
              </Field>

              {precision === "exact" ? (
                <div className="a-grid" data-cols="2">
                  <Field label="Starts" error={touched ? errors.dates : ""}>
                    <input
                      className="a-input"
                      type="date"
                      value={dateStart}
                      aria-invalid={touched && !!errors.dates}
                      onChange={(e) => setDateStart(e.target.value)}
                    />
                  </Field>
                  <Field label="Ends" optional hint="Leave empty for a one-day event.">
                    <input
                      className="a-input"
                      type="date"
                      value={dateEnd}
                      min={dateStart || undefined}
                      onChange={(e) => setDateEnd(e.target.value)}
                    />
                  </Field>
                </div>
              ) : (
                <Field label="Year" error={touched ? errors.dates : ""}>
                  <input
                    className="a-input"
                    inputMode="numeric"
                    maxLength={4}
                    style={{ maxWidth: 140 }}
                    value={yearOnly}
                    aria-invalid={touched && !!errors.dates}
                    onChange={(e) => setYearOnly(e.target.value.replace(/\D/g, ""))}
                    placeholder="2019"
                  />
                </Field>
              )}

              <div className="a-readsAs">
                <span className="a-hint">Will read as</span>
                <strong style={{ fontSize: 14 }}>{resolved.label || "—"}</strong>
              </div>
            </div>
          </section>

          <section className="a-section">
            <div className="a-sectionHead">
              <h2 className="a-sectionTitle">About it</h2>
              <p className="a-sectionNote">
                The opening lines are shown on the Collaborations page with a “See more” link; the
                whole text is on its own page. Leave a blank line between paragraphs.
              </p>
            </div>

            <Field label="Description" optional>
              <textarea
                className="a-textarea"
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Having reached out to audiences in Copenhagen, Paris and Marrakech, the exhibition arrives in Dhaka…"
              />
            </Field>
          </section>

          <div className="a-formBar">
            <span className="a-hint">
              {isNew ? "Not saved yet" : "Editing an existing collaboration"}
            </span>
            <Link href="/admin/collaborations" className="a-btn">
              Cancel
            </Link>
            <button type="submit" className="a-btn" data-variant="primary" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Add collaboration" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
