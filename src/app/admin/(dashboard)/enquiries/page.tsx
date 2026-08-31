"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Topbar } from "@/components/admin/AdminShell";
import { Badge, ConfirmDelete, Empty } from "@/components/admin/ui";
import { CheckIcon, MailIcon } from "@/components/admin/Icons";
import { useAdmin } from "@/lib/admin/store";
import { formatDate, relativeTime } from "@/lib/admin/slug";

export default function Enquiries() {
  const { data, setEnquiryStatus, deleteEnquiry } = useAdmin();
  const [filter, setFilter] = useState<"all" | "new">("all");

  const artworks = useMemo(
    () => new Map(data.artworks.map((w) => [w.id, w])),
    [data.artworks],
  );

  const rows = useMemo(
    () =>
      [...data.enquiries]
        .filter((e) => filter === "all" || e.status === "new")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.enquiries, filter],
  );

  const unread = data.enquiries.filter((e) => e.status === "new").length;

  return (
    <>
      <Topbar
        title="Enquiries"
        actions={
          unread > 0 && (
            <button
              className="a-btn"
              onClick={() =>
                data.enquiries
                  .filter((e) => e.status === "new")
                  .forEach((e) => setEnquiryStatus(e.id, "read"))
              }
            >
              <CheckIcon /> Mark all read
            </button>
          )
        }
      />

      <div className="a-body">
        <div className="a-toolbar">
          <div className="a-chips">
            <button
              type="button"
              className="a-chip"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All ({data.enquiries.length})
            </button>
            <button
              type="button"
              className="a-chip"
              aria-pressed={filter === "new"}
              onClick={() => setFilter("new")}
            >
              Unread ({unread})
            </button>
          </div>
        </div>

        <div className="a-card">
          {rows.length === 0 ? (
            <Empty title={filter === "new" ? "Nothing unread" : "No enquiries yet"}>
              <p>Messages sent from the contact form will appear here.</p>
            </Empty>
          ) : (
            rows.map((e) => {
              const work = e.artworkId ? artworks.get(e.artworkId) : null;
              return (
                <article key={e.id} className="a-enq" data-unread={e.status === "new"}>
                  <div className="a-enqHead">
                    <span className="a-enqName">{e.name}</span>
                    {e.status === "new" && (
                      <Badge tone="accent" dot>
                        New
                      </Badge>
                    )}
                    {work && (
                      <Link href={`/admin/artworks/${work.id}`} className="a-badge" data-tone="muted">
                        About: {work.title}
                      </Link>
                    )}
                    <span className="a-enqMeta" style={{ marginLeft: "auto" }} title={formatDate(e.createdAt)}>
                      {relativeTime(e.createdAt)}
                    </span>
                  </div>

                  <div className="a-enqMeta">
                    {e.email}
                    {e.phone && ` · ${e.phone}`}
                  </div>

                  <p className="a-enqMsg">{e.message}</p>

                  <div className="a-enqActions">
                    <a
                      className="a-btn"
                      data-size="sm"
                      data-variant="primary"
                      href={`mailto:${e.email}?subject=${encodeURIComponent(
                        work ? `Re: ${work.title}` : "Re: your enquiry",
                      )}`}
                    >
                      <MailIcon size={14} /> Reply
                    </a>
                    <button
                      type="button"
                      className="a-btn"
                      data-size="sm"
                      onClick={() => setEnquiryStatus(e.id, e.status === "new" ? "read" : "new")}
                    >
                      {e.status === "new" ? "Mark read" : "Mark unread"}
                    </button>
                    <ConfirmDelete onConfirm={() => deleteEnquiry(e.id)} />
                  </div>
                </article>
              );
            })
          )}
        </div>

        <p className="a-hint">
          Replies open your own mail app — the gallery never sends mail on your behalf, so nothing
          here depends on the email setup still to be done.
        </p>
      </div>
    </>
  );
}
