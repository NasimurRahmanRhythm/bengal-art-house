"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Topbar } from "./AdminShell";
import { Badge, ConfirmDelete, Field, Segmented } from "./ui";
import ImageUpload from "./ImageUpload";
import { useAdmin } from "@/lib/admin/store";
import { nextPlate, uniqueSlug } from "@/lib/admin/slug";
import { exhibitionPhase, type Exhibition } from "@/lib/admin/types";
import { formatRange } from "@/lib/admin/dates";

export default function ExhibitionForm({ exhibition }: { exhibition?: Exhibition }) {
  const router = useRouter();
  const { data, saveExhibition, deleteExhibition } = useAdmin();
  const isNew = !exhibition;

  const [title, setTitle] = useState(exhibition?.title ?? "");
  const [venue, setVenue] = useState(exhibition?.venue ?? "");
  const [precision, setPrecision] = useState<"exact" | "year">(
    exhibition && !exhibition.dateStart ? "year" : "exact",
  );
  const [dateStart, setDateStart] = useState(exhibition?.dateStart ?? "");
  const [dateEnd, setDateEnd] = useState(exhibition?.dateEnd ?? "");
  const [yearOnly, setYearOnly] = useState(exhibition?.year ?? "");
  const [ticketInfo, setTicketInfo] = useState(exhibition?.ticketInfo ?? "");
  const [openingHours, setOpeningHours] = useState(exhibition?.openingHours ?? "");
  const [blurb, setBlurb] = useState(exhibition?.blurb ?? "");
  const [photos, setPhotos] = useState<string[]>(exhibition?.photos ?? []);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const slug = useMemo(
    () =>
      uniqueSlug(
        title,
        data.exhibitions.map((e) => e.slug),
        exhibition?.slug,
      ),
    [title, data.exhibitions, exhibition?.slug],
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
          ? "Pick the opening date."
          : dateEnd && dateEnd < dateStart
            ? "The closing date is before the opening date."
            : ""
        : !/^\d{4}$/.test(yearOnly.trim())
          ? "Enter a four-digit year."
          : "",
  };
  const valid = !errors.title && !errors.dates;

  const draft: Exhibition = {
    id: exhibition?.id ?? "",
    slug,
    title,
    venue,
    dateStart: resolved.start,
    dateEnd: resolved.end,
    dateLabel: resolved.label,
    year: resolved.year,
    ticketInfo,
    openingHours,
    blurb,
    photos,
    plate: exhibition?.plate ?? 0,
  };
  const phase = exhibitionPhase(draft);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || saving) return;
    setSaving(true);

    await saveExhibition({
      ...draft,
      title: title.trim(),
      venue: venue.trim(),
      ticketInfo: ticketInfo.trim(),
      openingHours: openingHours.trim(),
      blurb: blurb.trim(),
      plate: exhibition?.plate ?? nextPlate(data.exhibitions.map((x) => x.plate)),
    });
    router.push("/admin/exhibitions");
  }

  return (
    <>
      <Topbar
        title={isNew ? "Add exhibition" : title || "Untitled"}
        parent={{ href: "/admin/exhibitions", label: "Exhibitions" }}
        actions={
          !isNew && (
            <ConfirmDelete
              size="md"
              label="Delete exhibition"
              onConfirm={async () => {
                await deleteExhibition(exhibition.id);
                router.push("/admin/exhibitions");
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
                  placeholder="Hamiduzzaman Khan Retrospective"
                />
              </Field>

              <Field label="Location" hint="Where it is held.">
                <input
                  className="a-input"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Bengal Shilpalay, Dhanmondi, Dhaka"
                />
              </Field>

              <Field label="Pictures" optional>
                <ImageUpload photos={photos} onChange={setPhotos} />
              </Field>
            </div>
          </section>

          <section className="a-section">
            <div className="a-sectionHead">
              <h2 className="a-sectionTitle">When</h2>
              <p className="a-sectionNote">
                On view, upcoming and past are worked out from this — there is no status to keep
                up to date.
              </p>
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
                  <Field label="Opens" error={touched ? errors.dates : ""}>
                    <input
                      className="a-input"
                      type="date"
                      value={dateStart}
                      aria-invalid={touched && !!errors.dates}
                      onChange={(e) => setDateStart(e.target.value)}
                    />
                  </Field>
                  <Field label="Closes" optional hint="Leave empty for a one-day event.">
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
                <Field
                  label="Year"
                  error={touched ? errors.dates : ""}
                  hint="For archive shows where the exact dates aren't recorded."
                >
                  <input
                    className="a-input"
                    inputMode="numeric"
                    maxLength={4}
                    style={{ maxWidth: 140 }}
                    value={yearOnly}
                    aria-invalid={touched && !!errors.dates}
                    onChange={(e) => setYearOnly(e.target.value.replace(/\D/g, ""))}
                    placeholder="1976"
                  />
                </Field>
              )}

              <div className="a-readsAs">
                <span className="a-hint">Will read as</span>
                <strong style={{ fontSize: 14 }}>{resolved.label || "—"}</strong>
                <Badge
                  tone={phase === "current" ? "good" : phase === "upcoming" ? "accent" : "muted"}
                  dot={phase === "current"}
                >
                  {phase === "current" ? "On view" : phase === "upcoming" ? "Upcoming" : "Past"}
                </Badge>
              </div>

              <div className="a-grid" data-cols="2">
                <Field label="Entry" optional hint="A price, or say it is free.">
                  <input
                    className="a-input"
                    value={ticketInfo}
                    onChange={(e) => setTicketInfo(e.target.value)}
                    placeholder="Free entry"
                  />
                </Field>

                <Field label="Opening hours" optional>
                  <input
                    className="a-input"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="Tue – Sat, 11:00 – 19:00"
                  />
                </Field>
              </div>

              <Field label="Description" optional hint="One or two sentences shown on the card.">
                <textarea
                  className="a-textarea"
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value)}
                  placeholder="Five decades gathered in one room — the maquettes, the drawings, and the prints…"
                />
              </Field>
            </div>
          </section>

          <div className="a-formBar">
            <span className="a-hint">{isNew ? "Not saved yet" : "Editing an existing show"}</span>
            <Link href="/admin/exhibitions" className="a-btn">
              Cancel
            </Link>
            <button type="submit" className="a-btn" data-variant="primary" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Add exhibition" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
