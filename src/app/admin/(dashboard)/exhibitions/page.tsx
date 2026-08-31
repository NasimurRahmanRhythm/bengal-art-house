"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Topbar } from "@/components/admin/AdminShell";
import { Badge, ConfirmDelete, Empty } from "@/components/admin/ui";
import { PlusIcon } from "@/components/admin/Icons";
import { useAdmin } from "@/lib/admin/store";
import { exhibitionPhase } from "@/lib/admin/types";

const PHASE = {
  current: { tone: "good", label: "On view" },
  upcoming: { tone: "accent", label: "Upcoming" },
  past: { tone: "muted", label: "Past" },
} as const;

export default function ExhibitionsList() {
  const { data, deleteExhibition } = useAdmin();

  // Sorted the way the gallery thinks about them: what's on, what's next,
  // then the archive newest-first.
  const rows = useMemo(() => {
    const order = { current: 0, upcoming: 1, past: 2 };
    return [...data.exhibitions].sort((a, b) => {
      const pa = order[exhibitionPhase(a)];
      const pb = order[exhibitionPhase(b)];
      if (pa !== pb) return pa - pb;
      return (b.dateStart ?? b.year).localeCompare(a.dateStart ?? a.year);
    });
  }, [data.exhibitions]);

  return (
    <>
      <Topbar
        title="Exhibitions"
        actions={
          <Link href="/admin/exhibitions/new" className="a-btn" data-variant="primary">
            <PlusIcon /> Add exhibition
          </Link>
        }
      />

      <div className="a-body">
        <p className="a-lede">
          On view, upcoming and past are worked out from the dates — there&apos;s no status to set,
          and nothing goes stale on its own.
        </p>

        <div className="a-card">
          {rows.length === 0 ? (
            <Empty title="No exhibitions yet">
              <p>Add a show and it will appear on the site straight away.</p>
            </Empty>
          ) : (
            <div className="a-tableWrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Exhibition</th>
                    <th>Dates</th>
                    <th>Phase</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => {
                    const phase = PHASE[exhibitionPhase(e)];
                    return (
                      <tr key={e.id}>
                        <td>
                          <div style={{ minWidth: 0 }}>
                            <Link href={`/admin/exhibitions/${e.id}`} className="a-rowTitle">
                              {e.title}
                            </Link>
                            <div className="a-rowSub">{e.venue || "—"}</div>
                          </div>
                        </td>
                        <td>
                          <span className="a-rowSub">{e.dateLabel || e.year || "—"}</span>
                        </td>
                        <td>
                          <Badge tone={phase.tone} dot={phase.label === "On view"}>
                            {phase.label}
                          </Badge>
                        </td>
                        <td>
                          <div className="a-rowActions">
                            <Link
                              href={`/admin/exhibitions/${e.id}`}
                              className="a-btn"
                              data-size="sm"
                            >
                              Edit
                            </Link>
                            <ConfirmDelete onConfirm={() => deleteExhibition(e.id)} />
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
