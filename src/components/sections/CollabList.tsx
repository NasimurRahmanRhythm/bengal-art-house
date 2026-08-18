"use client";

import { useEffect, useRef } from "react";
import { revealOnce } from "@/lib/motion";
import { COLLABORATIONS } from "@/data/gallery";
import styles from "./Sections.module.css";

export default function CollabList() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const rows = Array.from(el.querySelectorAll<HTMLElement>(`.${styles.collabRow}`));
    const cleanups = rows.map((row, i) => {
      row.style.setProperty("--item-delay", `${i * 0.04}s`);
      return revealOnce(row, () => row.classList.add(styles.rowVisible), { threshold: 0.2 });
    });

    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <div ref={root} className={styles.collabList}>
      {COLLABORATIONS.map((c) => (
        <article key={c.title} className={styles.collabRow}>
          <span className={styles.collabLine} aria-hidden="true" />
          <span className={styles.collabPlace}>{c.place}</span>
          <div>
            <h3 className={styles.collabTitle}>{c.title}</h3>
            <p className={styles.collabBody}>{c.body}</p>
          </div>
          <span className={styles.collabYear}>{c.years}</span>
        </article>
      ))}
    </div>
  );
}
