"use client";

import { useEffect, useRef } from "react";
import { gridStaggerDelay, revealOnce } from "@/lib/motion";
import { WORKS } from "@/data/gallery";
import styles from "./Sections.module.css";

export default function WorksGrid() {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;

    Array.from(el.children).forEach((child, i) => {
      const delay = gridStaggerDelay(i, 3, 3, 0.06, "start");
      (child as HTMLElement).style.setProperty("--item-delay", `${delay}s`);
    });

    return revealOnce(el, () => {
      Array.from(el.children).forEach((child) => child.classList.add(styles.inView));
    });
  }, []);

  return (
    <div ref={grid} className={`${styles.worksGrid} ${styles.worksReveal}`} id="sculptures">
      {WORKS.map((w) => (
        <article key={w.index} className={styles.workCard}>
          <span className={styles.workIndex}>{w.index}</span>
          <div>
            <h3 className={styles.workTitle}>{w.title}</h3>
            <p className={styles.workMedium}>{w.medium}</p>
            <p className={styles.workLoc}>{w.location}</p>
          </div>
          <span className={styles.workRule} aria-hidden="true" />
        </article>
      ))}
    </div>
  );
}
