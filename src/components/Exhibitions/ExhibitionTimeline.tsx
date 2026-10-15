"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { revealEach } from "@/lib/motion";
import type { Exhibition } from "@/data/gallery";
import styles from "./Exhibitions.module.css";

const STATUS_LABEL = {
  current: "On view",
  upcoming: "Upcoming",
  past: "Archive",
} as const;

/** Chronological list with a spine that draws itself as you scroll past it. */
export default function ExhibitionTimeline({ exhibitions }: { exhibitions: Exhibition[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // Row by row as each reaches the screen: the archive keeps growing, and a
    // trigger on the whole list stops firing once it outgrows the screen.
    const rows = Array.from(el.querySelectorAll<HTMLElement>(`.${styles.row}`));
    return revealEach(rows, (row) => row.classList.add(styles.rowVisible));
  }, []);

  // Spine draw is continuously scroll-scrubbed, not a one-shot reveal — kept on ScrollTrigger.
  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      gsap.to(el.querySelector(`.${styles.spine}`), {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 72%", end: "bottom 82%", scrub: 0.5 },
      });
    },
    { scope: root }
  );

  if (exhibitions.length === 0) {
    return <p className={styles.emptyNote}>Exhibitions will be listed here soon.</p>;
  }

  return (
    <div ref={root} className={styles.timeline}>
      <span className={styles.spine} aria-hidden="true" />

      {exhibitions.map((ex) => (
        <article key={ex.id} className={styles.row}>
          <div className={styles.year}>
            {ex.year}
            <span className={styles.node} aria-hidden="true" />
          </div>
          <div>
            <h3 className={styles.rowTitle}>
              <Link href={`/exhibitions/${ex.id}`}>{ex.title}</Link>
            </h3>
            <p className={styles.rowVenue}>{ex.venue}</p>
            <p className={styles.rowBlurb}>{ex.blurb}</p>
          </div>
          <div className={styles.rowMeta}>
            <span
              className={styles.rowStatus}
              style={
                ex.status === "current"
                  ? { background: "var(--oxide)" }
                  : ex.status === "upcoming"
                    ? { background: "var(--patina)" }
                    : undefined
              }
            >
              {STATUS_LABEL[ex.status]}
            </span>
            <span className={styles.rowTag}>{ex.tag}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
