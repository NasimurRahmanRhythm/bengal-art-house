"use client";

import Counter from "@/components/motion/Counter";
import Reveal from "@/components/motion/Reveal";
import { MEDIUMS } from "@/data/artworks";
import styles from "./Sections.module.css";

export default function MediumGrid() {
  return (
    <Reveal className={styles.mediumGrid} stagger={0.09} variant="wipe">
      {MEDIUMS.map((m) => (
        <article key={m.title} className={styles.mediumCard}>
          <span className={styles.mediumTag}>{m.tag}</span>
          <h3 className={styles.mediumTitle}>{m.title}</h3>
          <p className={styles.mediumBlurb}>{m.blurb}</p>
          <span className={styles.mediumCount}>
            <Counter value={m.count} /> works
          </span>
        </article>
      ))}
    </Reveal>
  );
}
