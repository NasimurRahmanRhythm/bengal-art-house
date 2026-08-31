"use client";

import Link from "next/link";
import { Topbar } from "@/components/admin/AdminShell";
import { Badge, Empty } from "@/components/admin/ui";
import { InfoIcon, PlusIcon } from "@/components/admin/Icons";
import { useAdmin, useCounts } from "@/lib/admin/store";
import { formatBDT, relativeTime } from "@/lib/admin/slug";
import { exhibitionPhase } from "@/lib/admin/types";

export default function AdminOverview() {
  const { data } = useAdmin();
  const c = useCounts();

  const recent = [...data.enquiries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  const onView = data.exhibitions.filter((e) => exhibitionPhase(e) === "current");
  const upcoming = data.exhibitions.filter((e) => exhibitionPhase(e) === "upcoming");

  return (
    <>
      <Topbar
        title="Overview"
        actions={
          <Link href="/admin/artworks/new" className="a-btn" data-variant="primary">
            <PlusIcon /> Add artwork
          </Link>
        }
      />

      <div className="a-body">
        <div className="a-banner">
          <InfoIcon />
          <div className="a-bannerBody">
            <strong>Preview mode — nothing is saved to the database.</strong>
            Edits are kept in this browser only, so you can click through every screen and judge
            what each one asks for. Tell me which fields to drop or add, and I&apos;ll change the
            schema before any of it becomes real.
          </div>
        </div>

        <div className="a-cards">
          <Link href="/admin/artworks" className="a-stat">
            <span className="a-statLabel">Artworks</span>
            <span className="a-statValue">{c.artworks}</span>
            <span className="a-statNote">
              {c.available} available · {c.sold} sold
              {c.reserved > 0 && ` · ${c.reserved} reserved`}
            </span>
          </Link>

          <div className="a-stat">
            <span className="a-statLabel">Value on sale</span>
            <span className="a-statValue" style={{ fontSize: 21 }}>
              {formatBDT(c.stockValue)}
            </span>
            <span className="a-statNote">Available pieces only</span>
          </div>

          <Link href="/admin/orders" className="a-stat">
            <span className="a-statLabel">Taken</span>
            <span className="a-statValue" style={{ fontSize: 21 }}>
              {formatBDT(c.revenue)}
            </span>
            <span className="a-statNote">
              {c.orders} orders · {c.toFulfil} to send out
            </span>
          </Link>

          <Link href="/admin/artists" className="a-stat">
            <span className="a-statLabel">Artists</span>
            <span className="a-statValue">{c.artists}</span>
            <span className="a-statNote">Represented by the gallery</span>
          </Link>

          <Link href="/admin/exhibitions" className="a-stat">
            <span className="a-statLabel">Exhibitions</span>
            <span className="a-statValue">{c.exhibitions}</span>
            <span className="a-statNote">
              {onView.length} on view · {upcoming.length} upcoming
            </span>
          </Link>

          <Link href="/admin/enquiries" className="a-stat">
            <span className="a-statLabel">Unread enquiries</span>
            <span className="a-statValue" style={{ color: c.unread ? "var(--a-accent)" : undefined }}>
              {c.unread}
            </span>
            <span className="a-statNote">{data.enquiries.length} in total</span>
          </Link>
        </div>

        <div className="a-card">
          <div className="a-cardHead">
            <h2 className="a-cardTitle">Latest enquiries</h2>
            <Link href="/admin/enquiries" className="a-btn" data-size="sm">
              Open inbox
            </Link>
          </div>

          {recent.length === 0 ? (
            <Empty title="No enquiries yet">
              <p>Messages from the contact form will land here.</p>
            </Empty>
          ) : (
            <div className="a-tableWrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Message</th>
                    <th>Received</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <div className="a-rowMain">
                          <div>
                            <div style={{ fontWeight: 500 }}>{e.name}</div>
                            <div className="a-rowSub">{e.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: 420 }}>
                        <span className="a-rowSub">
                          {e.message.length > 96 ? `${e.message.slice(0, 96)}…` : e.message}
                        </span>
                      </td>
                      <td className="a-num">{relativeTime(e.createdAt)}</td>
                      <td>
                        {e.status === "new" ? (
                          <Badge tone="accent" dot>
                            New
                          </Badge>
                        ) : (
                          <Badge tone="muted">Read</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="a-card">
          <div className="a-cardHead">
            <h2 className="a-cardTitle">Not editable here</h2>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <p className="a-hint" style={{ maxWidth: "72ch" }}>
              Services, collaborations and the list of public installations stay in code for now —
              they change once a year at most, so a CRUD screen for them would be upkeep without
              payoff. Say the word if you&apos;d rather manage any of them here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
