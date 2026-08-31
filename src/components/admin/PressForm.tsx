"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Topbar } from "./AdminShell";
import RichTextEditor from "./RichTextEditor";
import { ConfirmDelete, Field } from "./ui";
import { useAdmin } from "@/lib/admin/store";
import { uniqueSlug } from "@/lib/admin/slug";
import { htmlToText, isBlank, sanitizeHtml } from "@/lib/admin/html";
import type { PressRelease } from "@/lib/admin/types";

/* Mirrors PostForm.tsx — media & press items are the same shape and the same
   editing experience as a blog post, just filed in their own table. Keep the
   two forms in step: a change made to how the blog editor saves or validates
   belongs here too. */

/** First couple of sentences of the body, used as the summary on the list. */
function summarise(html: string): string {
  const text = htmlToText(html);
  if (text.length <= 180) return text;
  const cut = text.slice(0, 180);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return stop > 90 ? cut.slice(0, stop + 1) : `${cut.trimEnd()}…`;
}

/** The first picture in the piece doubles as the card image. */
function firstImage(html: string): string | null {
  return /<img[^>]+src="([^"]+)"/i.exec(html)?.[1] ?? null;
}

export default function PressForm({ release }: { release?: PressRelease }) {
  const router = useRouter();
  const { data, saveRelease, deleteRelease } = useAdmin();
  const isNew = !release;

  const [title, setTitle] = useState(release?.title ?? "");
  const [publication, setPublication] = useState(release?.publication ?? "");
  const [author, setAuthor] = useState(release?.authorName ?? "");
  const [html, setHtml] = useState(release?.html ?? "");
  const [error, setError] = useState("");

  function save(publish: boolean) {
    if (!title.trim()) {
      setError("Please give it a title.");
      return;
    }
    if (isBlank(html)) {
      setError("Please write something before saving.");
      return;
    }
    setError("");

    const now = new Date().toISOString();
    const slug = uniqueSlug(title, data.pressReleases.map((p) => p.slug), release?.slug);

    saveRelease({
      id: release?.id ?? "",
      slug,
      title: title.trim(),
      publication: publication.trim(),
      authorName: author.trim(),
      excerpt: summarise(html),
      coverUrl: firstImage(html),
      tag: "",
      // Cleaned once, here — running the sanitiser on every keystroke would
      // fight the caret, and the editor's paste handler already filters the
      // one route stray markup arrives by.
      html: sanitizeHtml(html),
      published: publish,
      // Stamped the first time it goes live and then left alone, so editing
      // an old item does not shuffle it back to the top of the list.
      publishedAt: publish ? (release?.publishedAt ?? now) : null,
      createdAt: release?.createdAt ?? now,
      updatedAt: now,
    });
    router.push("/admin/press");
  }

  return (
    <>
      <Topbar
        title={isNew ? "New press item" : title || "Untitled"}
        parent={{ href: "/admin/press", label: "Media & Press Release" }}
        actions={
          !isNew && (
            <ConfirmDelete
              size="md"
              label="Delete"
              onConfirm={() => {
                deleteRelease(release.id);
                router.push("/admin/press");
              }}
            />
          )
        }
      />

      <div className="a-body">
        <form
          className="a-form"
          data-wide
          onSubmit={(e) => {
            e.preventDefault();
            save(release?.published ?? false);
          }}
          noValidate
        >
          <section className="a-section">
            <div className="a-grid" data-cols="2">
              <Field label="Title">
                <input
                  className="a-input a-titleInput"
                  value={title}
                  autoFocus
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Gallery Hamiduzzaman featured in The Daily Star"
                />
              </Field>

              <Field label="Publication" optional hint="Which paper or channel ran it.">
                <input
                  className="a-input"
                  value={publication}
                  onChange={(e) => setPublication(e.target.value)}
                  placeholder="The Daily Star"
                />
              </Field>
            </div>

            <Field label="Author" optional>
              <input
                className="a-input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Gallery Hamiduzzaman"
              />
            </Field>
          </section>

          <section className="a-section">
            <div className="a-editorHead">
              <h2 className="a-sectionTitle">Write the item</h2>
            </div>

            <RichTextEditor value={html} onChange={setHtml} placeholder="Start writing here…" />
          </section>

          {error && <p className="a-formError">{error}</p>}

          <div className="a-formBar" data-end>
            <Link href="/admin/press" className="a-btn">
              Cancel
            </Link>

            {release?.published ? (
              <>
                <button type="button" className="a-btn" onClick={() => save(false)}>
                  Move to drafts
                </button>
                <button type="button" className="a-btn" data-variant="primary" onClick={() => save(true)}>
                  Save changes
                </button>
              </>
            ) : (
              <>
                <button type="button" className="a-btn" onClick={() => save(false)}>
                  Save as draft
                </button>
                <button type="button" className="a-btn" data-variant="primary" onClick={() => save(true)}>
                  Publish
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
