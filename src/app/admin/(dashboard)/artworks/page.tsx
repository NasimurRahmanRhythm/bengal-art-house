"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Topbar } from "@/components/admin/AdminShell";
import { Badge, ConfirmDelete, Empty } from "@/components/admin/ui";
import { PlusIcon, SearchIcon } from "@/components/admin/Icons";
import { useAdmin, useArtistMap } from "@/lib/admin/store";
import { formatBDT } from "@/lib/admin/slug";
import type { ArtworkStatus } from "@/lib/admin/types";

const FILTERS: { value: ArtworkStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

const STATUS_TONE = {
  available: "good",
  reserved: "warn",
  sold: "muted",
} as const;

export default function ArtworksList() {
  const { data, setArtworkStatus, deleteArtwork } = useAdmin();
  const artists = useArtistMap();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ArtworkStatus | "all">("all");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.artworks.filter((w) => {
      if (filter !== "all" && w.status !== filter) return false;
      if (!needle) return true;
      const artist = artists.get(w.artistId)?.name ?? "";
      return `${w.title} ${artist}`.toLowerCase().includes(needle);
    });
  }, [data.artworks, artists, q, filter]);

  const counts = useMemo(
    () => ({
      all: data.artworks.length,
      available: data.artworks.filter((w) => w.status === "available").length,
      reserved: data.artworks.filter((w) => w.status === "reserved").length,
      sold: data.artworks.filter((w) => w.status === "sold").length,
    }),
    [data.artworks],
  );

  return (
    <>
      <Topbar
        title="Artworks"
        actions={
          <Link href="/admin/artworks/new" className="a-btn" data-variant="primary">
            <PlusIcon /> Add artwork
          </Link>
        }
      />

      <div className="a-body">
        <div className="a-toolbar">
          <div className="a-search">
            <SearchIcon className="a-searchIcon" />
            <input
              className="a-input"
              placeholder="Search by name or artist…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="a-chips">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className="a-chip"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.label} ({counts[f.value]})
              </button>
            ))}
          </div>
        </div>

        <div className="a-card">
          {rows.length === 0 ? (
            <Empty title={q || filter !== "all" ? "Nothing matches" : "No artworks yet"}>
              <p>
                {q || filter !== "all"
                  ? "Try a different search or filter."
                  : "Add the first piece to get started."}
              </p>
            </Empty>
          ) : (
            <div className="a-tableWrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Work</th>
                    <th>Artist</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((w) => {
                    const artist = artists.get(w.artistId);
                    return (
                      <tr key={w.id}>
                        <td>
                          <div className="a-rowMain">
                            {w.photos[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={w.photos[0]} alt="" className="a-thumb" />
                            ) : (
                              <span className="a-thumbFallback">
                                {w.title.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <Link href={`/admin/artworks/${w.id}`} className="a-rowTitle">
                                {w.title}
                              </Link>
                              <div className="a-rowSub">
                                {w.photos.length === 0
                                  ? "No picture yet"
                                  : `${w.photos.length} picture${w.photos.length > 1 ? "s" : ""}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="a-rowSub">{artist?.name ?? "—"}</span>
                        </td>
                        <td className="a-num">{w.price > 0 ? formatBDT(w.price) : "—"}</td>
                        <td>
                          <Badge tone={STATUS_TONE[w.status]} dot={w.status === "available"}>
                            {w.status[0].toUpperCase() + w.status.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          <div className="a-rowActions">
                            {/* The single most-used action in the whole panel,
                                so it is one click from the list — never a form. */}
                            <button
                              type="button"
                              className="a-btn"
                              data-size="sm"
                              onClick={() =>
                                setArtworkStatus(w.id, w.status === "sold" ? "available" : "sold")
                              }
                            >
                              {w.status === "sold" ? "Mark available" : "Mark sold"}
                            </button>
                            <Link href={`/admin/artworks/${w.id}`} className="a-btn" data-size="sm">
                              Edit
                            </Link>
                            <ConfirmDelete onConfirm={() => deleteArtwork(w.id)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
