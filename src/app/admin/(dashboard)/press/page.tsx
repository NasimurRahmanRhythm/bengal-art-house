"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Topbar } from "@/components/admin/AdminShell";
import { Badge, ConfirmDelete, Empty } from "@/components/admin/ui";
import { PlusIcon, SearchIcon } from "@/components/admin/Icons";
import { useAdmin } from "@/lib/admin/store";
import { formatDate } from "@/lib/admin/slug";
import { htmlToText } from "@/lib/admin/html";

/* Mirrors src/app/admin/blog/page.tsx — same list, same table, reading from
   data.pressReleases instead of data.posts. Keep the two in step. */

export default function PressList() {
  const { data, deleteRelease } = useAdmin();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...data.pressReleases]
      .filter((p) => {
        if (filter === "published" && !p.published) return false;
        if (filter === "draft" && p.published) return false;
        if (!needle) return true;
        return `${p.title} ${htmlToText(p.html)}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt));
  }, [data.pressReleases, q, filter]);

  const counts = {
    all: data.pressReleases.length,
    published: data.pressReleases.filter((p) => p.published).length,
    draft: data.pressReleases.filter((p) => !p.published).length,
  };

  return (
    <>
      <Topbar
        title="Media & Press Release"
        actions={
          <Link href="/admin/press/new" className="a-btn" data-variant="primary">
            <PlusIcon /> Add press release
          </Link>
        }
      />

      <div className="a-body">
        <div className="a-toolbar">
          <div className="a-search">
            <SearchIcon className="a-searchIcon" />
            <input
              className="a-input"
              placeholder="Search titles and text…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="a-chips">
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className="a-chip"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "published" ? "Published" : "Drafts"} ({counts[f]})
              </button>
            ))}
          </div>
        </div>

        <div className="a-card">
          {rows.length === 0 ? (
            <Empty title={q || filter !== "all" ? "Nothing matches" : "Nothing here yet"}>
              <p style={{ marginBottom: 14 }}>
                {q || filter !== "all"
                  ? "Try a different search or filter."
                  : "Press coverage and media mentions of the gallery get logged here."}
              </p>
              {!q && filter === "all" && (
                <Link href="/admin/press/new" className="a-btn" data-variant="primary">
                  <PlusIcon /> Add the first item
                </Link>
              )}
            </Empty>
          ) : (
            <div className="a-tableWrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id}>
                      <td style={{ maxWidth: 460 }}>
                        <div className="a-rowMain">
                          {p.coverUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.coverUrl} alt="" className="a-thumb" />
                          ) : (
                            <span className="a-thumbFallback">
                              {(p.title || "??").slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <Link href={`/admin/press/${p.id}`} className="a-rowTitle">
                              {p.title || "Untitled"}
                            </Link>
                            <div className="a-rowSub a-clamp">{p.excerpt}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="a-stack">
                          <Badge tone={p.published ? "good" : "muted"} dot={p.published}>
                            {p.published ? "Published" : "Draft"}
                          </Badge>
                          <span className="a-rowSub">
                            {p.published && p.publishedAt
                              ? formatDate(p.publishedAt)
                              : `Edited ${formatDate(p.updatedAt)}`}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="a-rowActions">
                          <Link href={`/admin/press/${p.id}`} className="a-btn" data-size="sm">
                            Edit
                          </Link>
                          <ConfirmDelete onConfirm={() => deleteRelease(p.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
