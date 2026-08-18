"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { revealOnce } from "@/lib/motion";
import { EXHIBITIONS } from "@/data/gallery";
import styles from "./Exhibitions.module.css";

const STATUS_LABEL = {
  current: "On view",
  upcoming: "Upcoming",
  past: "Archive",
} as const;

/** Chronological list with a spine that draws itself as you scroll past it. */
export default function ExhibitionTimeline() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const rows = Array.from(el.querySelectorAll<HTMLElement>(`.${styles.row}`));
    rows.forEach((row, i) => row.style.setProperty("--item-delay", `${i * 0.12}s`));

    return revealOnce(
      el,
      () => rows.forEach((row) => row.classList.add(styles.rowVisible)),
      { threshold: 0.1 }
    );
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

  return (
    <div ref={root} className={styles.timeline}>
      <span className={styles.spine} aria-hidden="true" />

      {EXHIBITIONS.map((ex) => (
        <article key={ex.id} className={styles.row}>
          <div className={styles.year}>
            {ex.year}
            <span className={styles.node} aria-hidden="true" />
          </div>
          <div>
            <h3 className={styles.rowTitle}>{ex.title}</h3>
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
