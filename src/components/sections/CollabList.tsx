"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { revealOnce } from "@/lib/motion";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { ArrowIcon } from "@/components/Icons";
import type { Collaboration } from "@/data/gallery";
import styles from "./Sections.module.css";

/** The opening of the write-up for the list: the first paragraph, cut at a
    word near 220 characters. The full text is on the collaboration's page. */
function excerpt(body: string): string {
  const first = body.split(/\n\s*\n/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  if (first.length <= 220) return first;
  const cut = first.slice(0, 220);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:–—-]+$/, "")}…`;
}

export default function CollabList({ items }: { items: Collaboration[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const rows = Array.from(el.querySelectorAll<HTMLElement>(`.${styles.collabRow}`));
    const cleanups = rows.map((row, i) => {
      row.style.setProperty("--item-delay", `${Math.min(i, 4) * 0.04}s`);
      return revealOnce(row, () => row.classList.add(styles.rowVisible), { threshold: 0.15 });
    });

    return () => cleanups.forEach((c) => c());
  }, [items]);

  if (items.length === 0) {
    return (
      <p className={styles.collabEmpty}>
        Collaborations will be listed here soon.
      </p>
    );
  }

  return (
    <div ref={root} className={styles.collabList}>
      {items.map((c, i) => {
        const href = `/collaborations/${c.slug}`;
        const intro = excerpt(c.body);
        return (
          <article key={c.slug} className={styles.collabRow}>
            <span className={styles.collabLine} aria-hidden="true" />

            <Link href={href} className={styles.collabPlate} tabIndex={-1} aria-hidden="true">
              {c.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.photos[0]} alt="" className={styles.collabPhoto} loading="lazy" />
              ) : (
                <ArtPlate variant={i} />
              )}
            </Link>

            <div>
              <h3 className={styles.collabTitle}>
                <Link href={href}>{c.title}</Link>
              </h3>
              {c.subtitle && <p className={styles.collabSubtitle}>{c.subtitle}</p>}
              {c.artists && <span className={styles.collabArtists}>{c.artists}</span>}
              {c.date && <span className={styles.collabDate}>{c.date}</span>}
              {intro && <p className={styles.collabBody}>{intro}</p>}
              <Link href={href} className={styles.collabMore}>
                See more <ArrowIcon size={13} />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
