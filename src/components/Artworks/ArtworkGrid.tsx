"use client";

import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { CATEGORIES, formatBDT, type Artwork } from "@/data/artworks";
import ArtworkCard from "./ArtworkCard";
import QuickView from "./QuickView";
import styles from "./Artworks.module.css";

type Props = {
  artworks: Artwork[];
  limit?: number;
  showFilters?: boolean;
  artist?: string;
};

export default function ArtworkGrid({ artworks, limit, showFilters = false, artist }: Props) {
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [active, setActive] = useState<Artwork | null>(null);
  const grid = useRef<HTMLDivElement>(null);

  const byArtist = useMemo(
    () => (artist ? artworks.filter((a) => a.artist === artist) : artworks),
    [artist, artworks]
  );

  // Only the categories actually on the shelf get a chip — an empty
  // "Calligraphy (0)" is a dead end, not a filter.
  const chips = useMemo(
    () => ["all", ...CATEGORIES.filter((c) => byArtist.some((a) => a.category === c))],
    [byArtist]
  );

  // Left blank means "no bound on that end", so either half of the range works
  // on its own.
  const min = minPrice.trim() === "" ? 0 : Number(minPrice);
  const max = maxPrice.trim() === "" ? Infinity : Number(maxPrice);
  const rangeInverted = Number.isFinite(max) && max < min;

  const inCategory = (a: Artwork, key: string) => key === "all" || a.category === key;

  // A piece with no price ("on request") has nothing to compare, so it drops
  // out as soon as either end of the range is filled in.
  const ranged = minPrice.trim() !== "" || maxPrice.trim() !== "";

  const visible = useMemo(() => {
    const list = byArtist.filter(
      (a) =>
        inCategory(a, category) &&
        (rangeInverted || !ranged || (a.price > 0 && a.price >= min && a.price <= max))
    );
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }, [category, min, max, ranged, rangeInverted, limit, byArtist]);

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
    { dependencies: [category, min, max, limit] }
  );

  return (
    <>
      {showFilters && (
        <div className={styles.filterBar}>
          <div className={styles.filters} role="group" aria-label="Filter works by category">
            {chips.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`${styles.filterBtn} ${category === key ? styles.filterActive : ""}`}
                aria-pressed={category === key}
                data-cursor="link"
              >
                {key === "all" ? "All works" : key}
                <span className={styles.filterCount}>
                  {byArtist.filter((a) => inCategory(a, key)).length}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.priceRange}>
            <span className={styles.priceLabel}>Price</span>
            <input
              className={styles.priceInput}
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
              placeholder="Any"
              aria-label="Lowest price"
            />
            <span className={styles.priceDash}>to</span>
            <input
              className={styles.priceInput}
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
              placeholder="Any"
              aria-label="Highest price"
            />
            {(minPrice || maxPrice) && (
              <button
                type="button"
                className={styles.priceClear}
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                data-cursor="link"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {showFilters && rangeInverted && (
        <p className={styles.emptyState}>
          The highest price is below the lowest — showing every work in {" "}
          {category === "all" ? "the gallery" : category}.
        </p>
      )}

      {visible.length === 0 ? (
        <p className={styles.emptyState}>
          {byArtist.length === 0
            ? "No works listed yet — check back soon."
            : `Nothing between ${formatBDT(min)} and ${
                Number.isFinite(max) ? formatBDT(max) : "any price"
              }${category === "all" ? "" : ` in ${category}`}.`}
        </p>
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
