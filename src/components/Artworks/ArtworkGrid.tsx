"use client";

import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { ARTWORKS, type ArtGroup, type Artwork } from "@/data/artworks";
import ArtworkCard from "./ArtworkCard";
import QuickView from "./QuickView";
import styles from "./Artworks.module.css";

const FILTERS: { id: ArtGroup | "all"; label: string }[] = [
  { id: "all", label: "All works" },
  { id: "bronze", label: "Bronze" },
  { id: "stone", label: "Stone" },
  { id: "steel", label: "Steel" },
  { id: "paper", label: "On paper" },
];

type Props = {
  /** Cap the number of cards — the home page shows a short edit. */
  limit?: number;
  showFilters?: boolean;
  /** Restrict to one artist's works — used on artist profile pages. */
  artist?: string;
};

export default function ArtworkGrid({ limit, showFilters = false, artist }: Props) {
  const [filter, setFilter] = useState<ArtGroup | "all">("all");
  const [active, setActive] = useState<Artwork | null>(null);
  const grid = useRef<HTMLDivElement>(null);

  const byArtist = useMemo(
    () => (artist ? ARTWORKS.filter((a) => a.artist === artist) : ARTWORKS),
    [artist]
  );

  const visible = useMemo(() => {
    const list = filter === "all" ? byArtist : byArtist.filter((a) => a.group === filter);
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }, [filter, limit, byArtist]);

  /* Cards drop into place on first view, and re-deal on every filter change. */
  useGSAP(
    () => {
      const cards = grid.current?.children;
      if (!cards?.length) return;

      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1 });
        return;
      }

      gsap.fromTo(
        cards,
        { opacity: 0, y: 54, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          stagger: { each: 0.075, from: "start" },
          ease: "power3.out",
          scrollTrigger: { trigger: grid.current, start: "top 88%", once: true },
        }
      );
      ScrollTrigger.refresh();
    },
    { dependencies: [filter, limit] }
  );

  return (
    <>
      {showFilters && (
        <div className={styles.filters} role="group" aria-label="Filter works by material">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`${styles.filterBtn} ${filter === f.id ? styles.filterActive : ""}`}
              aria-pressed={filter === f.id}
              data-cursor="link"
            >
              {f.label}
              <span className={styles.filterCount}>
                {f.id === "all"
                  ? ARTWORKS.length
                  : ARTWORKS.filter((a) => a.group === f.id).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className={styles.emptyState}>No works listed yet — check back soon.</p>
      ) : (
        <div ref={grid} className={styles.grid}>
          {visible.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} onQuickView={setActive} />
          ))}
        </div>
      )}

      <QuickView artwork={active} onClose={() => setActive(null)} />
    </>
  );
}
