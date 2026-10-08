"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Topbar } from "@/components/admin/AdminShell";
import { ConfirmDelete, Empty } from "@/components/admin/ui";
import { PlusIcon } from "@/components/admin/Icons";
import { useAdmin } from "@/lib/admin/store";

export default function CollaborationsList() {
  const { data, deleteCollaboration } = useAdmin();

  // Newest first, the way the public page lists them.
  const rows = useMemo(
    () =>
      [...data.collaborations].sort((a, b) =>
        (b.dateStart ?? b.year).localeCompare(a.dateStart ?? a.year),
      ),
    [data.collaborations],
  );

  return (
    <>
      <Topbar
        title="Collaborations"
        actions={
          <Link href="/admin/collaborations/new" className="a-btn" data-variant="primary">
            <PlusIcon /> Add collaboration
          </Link>
        }
      />

      <div className="a-body">
        <p className="a-lede">
          Partner exhibitions and projects. Each one gets its own page on the site, listed newest
          first.
        </p>

        <div className="a-card">
          {rows.length === 0 ? (
            <Empty title="No collaborations yet">
              <p>Add one and it will appear on the Collaborations page straight away.</p>
            </Empty>
          ) : (
            <div className="a-tableWrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Collaboration</th>
                    <th>Dates</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="a-rowMain">
                          {c.photos[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.photos[0]} alt="" className="a-thumb" />
                          ) : (
                            <span className="a-thumbFallback">
                              {c.title.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <Link href={`/admin/collaborations/${c.id}`} className="a-rowTitle">
                              {c.title}
                            </Link>
                            <div className="a-rowSub">{c.artists || c.subtitle || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="a-rowSub">{c.dateLabel || c.year || "—"}</span>
                      </td>
                      <td>
                        <div className="a-rowActions">
                          <Link
                            href={`/admin/collaborations/${c.id}`}
                            className="a-btn"
                            data-size="sm"
                          >
                            Edit
                          </Link>
                          <ConfirmDelete onConfirm={() => deleteCollaboration(c.id)} />
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
