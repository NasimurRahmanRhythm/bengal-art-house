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
import type { BlogPost } from "@/lib/admin/types";

/* Everything this screen can ask for, it works out instead: the web address
   comes from the title, the summary from the opening lines, the picture on the
   blog card from the first picture in the post. Three fewer things to fill in,
   and none of them was a decision anyone wanted to make. */

/** First couple of sentences of the body, used as the summary on the blog list. */
function summarise(html: string): string {
  const text = htmlToText(html);
  if (text.length <= 180) return text;
  const cut = text.slice(0, 180);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return stop > 90 ? cut.slice(0, stop + 1) : `${cut.trimEnd()}…`;
}

/** The first picture in the post doubles as the card image. */
function firstImage(html: string): string | null {
  return /<img[^>]+src="([^"]+)"/i.exec(html)?.[1] ?? null;
}

export default function PostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const { data, savePost, deletePost } = useAdmin();
  const isNew = !post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [author, setAuthor] = useState(post?.authorName ?? "");
  const [html, setHtml] = useState(post?.html ?? "");
  const [error, setError] = useState("");

  function save(publish: boolean) {
    if (!title.trim()) {
      setError("Please give the post a title.");
      return;
    }
    if (isBlank(html)) {
      setError("Please write something before saving.");
      return;
    }
    setError("");

    const now = new Date().toISOString();
    const slug = uniqueSlug(title, data.posts.map((p) => p.slug), post?.slug);

    savePost({
      id: post?.id ?? "",
      slug,
      title: title.trim(),
      authorName: author.trim(),
      excerpt: summarise(html),
      coverUrl: firstImage(html),
      tag: "",
      // Cleaned once, here — running the sanitiser on every keystroke would
      // fight the caret, and the editor's paste handler already filters the
      // one route stray markup arrives by.
      html: sanitizeHtml(html),
      published: publish,
      // Stamped the first time it goes live and then left alone, so editing an
      // old post does not shuffle it back to the top of the blog.
      publishedAt: publish ? (post?.publishedAt ?? now) : null,
      createdAt: post?.createdAt ?? now,
      updatedAt: now,
    });
    router.push("/admin/blog");
  }

  return (
    <>
      <Topbar
        title={isNew ? "New post" : title || "Untitled"}
        parent={{ href: "/admin/blog", label: "Blog" }}
        actions={
          !isNew && (
            <ConfirmDelete
              size="md"
              label="Delete post"
              onConfirm={() => {
                deletePost(post.id);
                router.push("/admin/blog");
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
            save(post?.published ?? false);
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
                  placeholder="Casting a bird in bronze"
                />
              </Field>

              <Field label="Author" optional>
                <input
                  className="a-input"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Gallery Hamiduzzaman"
                />
              </Field>
            </div>
          </section>

          <section className="a-section">
            <div className="a-editorHead">
              <h2 className="a-sectionTitle">Write the post</h2>
            </div>

            <RichTextEditor value={html} onChange={setHtml} placeholder="Start writing here…" />
          </section>

          {error && <p className="a-formError">{error}</p>}

          <div className="a-formBar" data-end>
            <Link href="/admin/blog" className="a-btn">
              Cancel
            </Link>

            {post?.published ? (
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
