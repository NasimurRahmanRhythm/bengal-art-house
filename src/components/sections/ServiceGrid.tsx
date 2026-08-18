"use client";

import { useEffect, useRef } from "react";
import { gridStaggerDelay, revealOnce } from "@/lib/motion";
import { SERVICES } from "@/data/gallery";
import { SERVICE_ICONS } from "@/components/Icons";
import styles from "./Sections.module.css";

export default function ServiceGrid() {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;

    Array.from(el.children).forEach((child, i) => {
      const delay = gridStaggerDelay(i, 3, 2, 0.07, "center");
      (child as HTMLElement).style.setProperty("--item-delay", `${delay}s`);
    });

    return revealOnce(el, () => {
      Array.from(el.children).forEach((child) => child.classList.add(styles.inView));
    });
  }, []);

  return (
    <div ref={grid} className={`${styles.serviceGrid} ${styles.gridReveal}`}>
      {SERVICES.map((s, i) => {
        const Icon = SERVICE_ICONS[s.icon];
        return (
          <article key={s.title} className={styles.serviceCard}>
            <span className={styles.serviceIcon}>
              <Icon size={24} />
            </span>
            <div>
              <h3 className={styles.serviceTitle}>{s.title}</h3>
              <p className={styles.serviceBody}>{s.body}</p>
            </div>
            <span className={styles.serviceIndex}>{String(i + 1).padStart(2, "0")}</span>
          </article>
        );
      })}
    </div>
  );
}
