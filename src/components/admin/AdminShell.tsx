"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAdmin, useCounts } from "@/lib/admin/store";
import { signOutAdmin } from "@/app/admin/login/actions";
import {
  BagIcon,
  CalendarIcon,
  ExternalIcon,
  FrameIcon,
  GaugeIcon,
  GlobeIcon,
  MailIcon,
  NewsIcon,
  PenIcon,
  PeopleIcon,
} from "./Icons";

const NAV = [
  { href: "/admin", label: "Overview", icon: GaugeIcon, exact: true },
  { href: "/admin/artworks", label: "Artworks", icon: FrameIcon, count: "artworks" as const },
  { href: "/admin/artists", label: "Artists", icon: PeopleIcon, count: "artists" as const },
  {
    href: "/admin/exhibitions",
    label: "Exhibitions",
    icon: CalendarIcon,
    count: "exhibitions" as const,
  },
  {
    href: "/admin/collaborations",
    label: "Collaborations",
    icon: GlobeIcon,
    count: "collaborations" as const,
  },
  {
    href: "/admin/governing-body",
    label: "Governing Body",
    icon: PeopleIcon,
    count: "governingBody" as const,
  },
  { href: "/admin/blog", label: "Blog", icon: PenIcon, count: "posts" as const },
  {
    href: "/admin/press",
    label: "Media & Press Release",
    icon: NewsIcon,
    count: "press" as const,
  },
  // The two counts that mean "someone is waiting on you" are the only ones
  // shown in alert colour.
  { href: "/admin/orders", label: "Orders", icon: BagIcon, count: "toFulfil" as const },
  { href: "/admin/enquiries", label: "Enquiries", icon: MailIcon, count: "unread" as const },
];

/** Says plainly whether what the gallery types here is being kept. */
function ConnectionNote() {
  const { status } = useAdmin();
  if (status === "loading") return <span>Loading…</span>;
  if (status === "live") return <span className="a-connected">Saving to the database</span>;
  return <span>Database unreachable — changes are not being saved</span>;
}

/** A failed write is the one thing the gallery must not miss. */
function SaveError() {
  const { error, clearError } = useAdmin();
  if (!error) return null;
  return (
    <div className="a-banner" role="alert">
      <span>{error}</span>
      <button type="button" className="a-btn" data-size="sm" onClick={clearError}>
        Dismiss
      </button>
    </div>
  );
}

export default function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const counts = useCounts();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="a-shell">
      <aside className="a-side">
        <Link href="/admin" className="a-brand">
          {/* the traced sculpture mark, same as the site favicon */}
          <img src="/icon.svg" alt="" className="a-brandMark" />
          <span className="a-brandText">
            <span className="a-brandTop">Gallery</span>
            <span className="a-brandName">Hamiduzzaman</span>
          </span>
        </Link>

        <nav className="a-navGroup" aria-label="Admin sections">
          <span className="a-navLabel">Manage</span>
          {NAV.map(({ href, label, icon: Icon, exact, count }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            const n = count ? counts[count] : undefined;
            return (
              <Link
                key={href}
                href={href}
                className="a-navItem"
                aria-current={active ? "page" : undefined}
              >
                <Icon className="a-navIcon" />
                {label}
                {n !== undefined && n > 0 && (
                  <span
                    className="a-navCount"
                    data-alert={count === "unread" || count === "toFulfil"}
                  >
                    {n}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="a-sideFoot">
          {email && (
            <div className="a-account">
              <span className="a-accountEmail" title={email}>
                {email}
              </span>
              <button
                type="button"
                className="a-linkBtn"
                disabled={signingOut}
                onClick={async () => {
                  setSigningOut(true);
                  await signOutAdmin();
                  router.replace("/admin/login");
                  router.refresh();
                }}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          )}
          <a href="/" target="_blank" rel="noreferrer" className="a-sideLink">
            View the site <ExternalIcon size={12} />
          </a>
          <ConnectionNote />
        </div>
      </aside>

      <div className="a-main">
        <SaveError />
        {children}
      </div>
    </div>
  );
}

/** Sticky page header. Rendered as the first child of .a-main by each page. */
export function Topbar({
  title,
  parent,
  actions,
}: {
  title: string;
  parent?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <header className="a-topbar">
      <div className="a-crumbs">
        {parent && (
          <>
            <Link href={parent.href} className="a-crumbLink">
              {parent.label}
            </Link>
            <span className="a-crumbLink" aria-hidden="true">
              /
            </span>
          </>
        )}
        <h1 className="a-title">{title}</h1>
      </div>
      {actions && <div className="a-topActions">{actions}</div>}
    </header>
  );
}
