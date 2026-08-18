"use client";

import { useEffect, useRef } from "react";
import { revealOnce } from "@/lib/motion";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import Reveal from "@/components/motion/Reveal";
import type { Artist } from "@/data/gallery";
import styles from "./ArtistProfile.module.css";

type Props = {
  artist: Artist;
};

export default function ArtistProfile({ artist }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const plate = el?.querySelector(`.${styles.plate}`);
    if (!el || !plate) return;
    return revealOnce(el, () => plate.classList.add(styles.plateVisible));
  }, []);

  return (
    <div ref={root} className={styles.grid}>
      <div>
        <span className={styles.plate}>
          <ArtPlate variant={artist.plate} />
          <span className={styles.initials}>{artist.initials}</span>
        </span>

        <Reveal className={styles.facts} stagger={0.08} delay={0.15}>
          {artist.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <span className={styles.factLabel}>{f.label}</span>
              <span className={styles.factValue}>{f.value}</span>
            </div>
          ))}
        </Reveal>
      </div>

      <Reveal stagger={0.12}>
        {artist.bio.map((para) => (
          <p key={para.slice(0, 24)} className={styles.bioPara}>
            {para}
          </p>
        ))}
      </Reveal>
    </div>
  );
}
