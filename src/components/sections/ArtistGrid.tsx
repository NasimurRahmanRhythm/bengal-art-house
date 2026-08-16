"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ARTISTS } from "@/data/gallery";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { ArrowIcon } from "@/components/Icons";
import styles from "./Sections.module.css";

export default function ArtistGrid() {
  const grid = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = grid.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el.children,
        { opacity: 0, y: 60, rotate: -1.2 },
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 0.95,
          stagger: 0.13,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        }
      );
    },
    { scope: grid }
  );

  return (
    <div ref={grid} className={styles.artistGrid}>
      {ARTISTS.map((a) => (
        <article key={a.slug} className={`${styles.artistCard} plateHost`}>
          {/* The whole card is one link — `display: contents` keeps the flex
              layout of its children exactly as if the Link weren't there. */}
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
