"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { revealOnce } from "@/lib/motion";
import { ARTISTS } from "@/data/gallery";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { ArrowIcon } from "@/components/Icons";
import styles from "./Sections.module.css";

export default function ArtistGrid() {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;

    Array.from(el.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty("--item-delay", `${i * 0.13}s`);
    });

    return revealOnce(el, () => {
      Array.from(el.children).forEach((child) => child.classList.add(styles.inView));
    });
  }, []);

  return (
    <div ref={grid} className={`${styles.artistGrid} ${styles.artistReveal}`}>
      {ARTISTS.map((a) => (
        <article key={a.slug} className={`${styles.artistCard} plateHost`}>
          <Link
            href={`/artists/${a.slug}`}
            style={{ display: "contents" }}
            data-cursor="link"
            aria-label={`View ${a.name}'s profile`}
          >
            <span className={styles.artistPlate}>
              <ArtPlate variant={a.plate} />
              <span className={styles.artistInitials}>{a.initials}</span>
            </span>
            <div className={styles.artistBody}>
              <h3 className={styles.artistName}>{a.name}</h3>
              <p className={styles.artistRole}>{a.role}</p>
              <p className={styles.artistText}>{a.body}</p>
              <span className={styles.artistLink}>
                View profile <ArrowIcon size={14} />
              </span>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
