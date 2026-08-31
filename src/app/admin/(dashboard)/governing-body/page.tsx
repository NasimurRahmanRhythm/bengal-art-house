"use client";

import Link from "next/link";
import { Topbar } from "@/components/admin/AdminShell";
import { ConfirmDelete, Empty } from "@/components/admin/ui";
import { PlusIcon } from "@/components/admin/Icons";
import { useAdmin } from "@/lib/admin/store";

export default function GoverningBodyList() {
  const { data, saveMember, deleteMember } = useAdmin();
  const rows = [...data.governingBody].sort((a, b) => a.orderIndex - b.orderIndex);

  /** Swap two members' places. The order is the gallery's own — chair first —
      so it is moved by hand rather than sorted by anything the data knows. */
  async function move(index: number, by: -1 | 1) {
    const a = rows[index];
    const b = rows[index + by];
    if (!a || !b) return;
    await saveMember({ ...a, orderIndex: b.orderIndex });
    await saveMember({ ...b, orderIndex: a.orderIndex });
  }

  return (
    <>
      <Topbar
        title="Governing Body"
        actions={
          <Link href="/admin/governing-body/new" className="a-btn" data-variant="primary">
            <PlusIcon /> Add member
          </Link>
        }
      />

      <div className="a-body">
        <p className="a-lede">
          The people who run the gallery. They appear on <code>/governing-body</code> in the order
          below — use the arrows to change it.
        </p>

        <div className="a-card">
          {rows.length === 0 ? (
            <Empty title="No members yet">
              <p style={{ marginBottom: 14 }}>Add the chair first — the order is kept.</p>
              <Link href="/admin/governing-body/new" className="a-btn" data-variant="primary">
                <PlusIcon /> Add member
              </Link>
            </Empty>
          ) : (
            <div className="a-tableWrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Position</th>
                    <th>Order</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m, i) => (
                    <tr key={m.id}>
                      <td>
                        <div className="a-rowMain">
                          {m.photos[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.photos[0]} alt="" className="a-thumb" />
                          ) : (
                            <span className="a-thumbFallback">
                              {m.name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <Link href={`/admin/governing-body/${m.id}`} className="a-rowTitle">
                              {m.name}
                            </Link>
                            <div className="a-rowSub">{m.bio ? "Has a description" : "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="a-rowSub">{m.role || "—"}</span>
                      </td>
                      <td>
                        <div className="a-rowActions">
                          <button
                            type="button"
                            className="a-btn"
                            data-size="sm"
                            disabled={i === 0}
                            onClick={() => move(i, -1)}
                            aria-label={`Move ${m.name} up`}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="a-btn"
                            data-size="sm"
                            disabled={i === rows.length - 1}
                            onClick={() => move(i, 1)}
                            aria-label={`Move ${m.name} down`}
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="a-rowActions">
                          <Link
                            href={`/admin/governing-body/${m.id}`}
                            className="a-btn"
                            data-size="sm"
                          >
                            Edit
                          </Link>
                          <ConfirmDelete onConfirm={() => deleteMember(m.id)} />
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
