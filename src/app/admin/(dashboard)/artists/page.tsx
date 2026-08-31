"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Topbar } from "@/components/admin/AdminShell";
import { Badge, ConfirmDelete, Empty } from "@/components/admin/ui";
import { PlusIcon, SearchIcon } from "@/components/admin/Icons";
import { useAdmin } from "@/lib/admin/store";

export default function ArtistsList() {
  const { data, deleteArtist } = useAdmin();
  const [q, setQ] = useState("");

  const worksPerArtist = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of data.artworks) m.set(w.artistId, (m.get(w.artistId) ?? 0) + 1);
    return m;
  }, [data.artworks]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return data.artists;
    return data.artists.filter((a) => a.name.toLowerCase().includes(needle));
  }, [data.artists, q]);

  return (
    <>
      <Topbar
        title="Artists"
        actions={
          <Link href="/admin/artists/new" className="a-btn" data-variant="primary">
            <PlusIcon /> Add artist
          </Link>
        }
      />

      <div className="a-body">
        <p className="a-lede">
          Each artist gets their own page at <code>/artists/…</code>, with their works pulled in
          automatically — you never link works to a page by hand.
        </p>

        <div className="a-toolbar">
          <div className="a-search">
            <SearchIcon className="a-searchIcon" />
            <input
              className="a-input"
              placeholder="Search artists…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="a-card">
          {rows.length === 0 ? (
            <Empty title={q ? "Nothing matches" : "No artists yet"}>
              <p>{q ? "Try a different search." : "Add an artist before adding their work."}</p>
            </Empty>
          ) : (
            <div className="a-tableWrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Artist</th>
                    <th>Works</th>
                    <th>Picture</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const count = worksPerArtist.get(a.id) ?? 0;
                    return (
                      <tr key={a.id}>
                        <td>
                          <div className="a-rowMain">
                            {a.photos[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={a.photos[0]} alt="" className="a-thumb" />
                            ) : (
                              <span className="a-thumbFallback">{a.initials}</span>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <Link href={`/admin/artists/${a.id}`} className="a-rowTitle">
                                {a.name}
                              </Link>
                              <div className="a-rowSub">
                                {a.bio.length > 0 ? `${a.bio.length} paragraphs` : "No biography yet"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="a-num">{count}</td>
                        <td>
                          {a.photos.length > 0 ? (
                            <Badge tone="good" dot>
                              Added
                            </Badge>
                          ) : (
                            <Badge tone="muted">None yet</Badge>
                          )}
                        </td>
                        <td>
                          <div className="a-rowActions">
                            <Link href={`/admin/artists/${a.id}`} className="a-btn" data-size="sm">
                              Edit
                            </Link>
                            {count > 0 ? (
                              <button
                                type="button"
                                className="a-btn"
                                data-size="sm"
                                disabled
                                title={`Reassign or remove ${count} work${count > 1 ? "s" : ""} first`}
                              >
                                In use
                              </button>
                            ) : (
                              <ConfirmDelete onConfirm={() => deleteArtist(a.id)} />
                            )}
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

        <p className="a-hint">
          An artist with works can&apos;t be deleted — the database enforces the same rule, so
          artworks can never end up orphaned.
        </p>
      </div>
    </>
  );
}
