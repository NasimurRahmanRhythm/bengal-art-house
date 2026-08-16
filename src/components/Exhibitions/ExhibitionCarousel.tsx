"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { ArrowIcon } from "@/components/Icons";
import { EXHIBITIONS } from "@/data/gallery";
import styles from "./Exhibitions.module.css";

const STATUS_LABEL = {
  current: "On view",
  upcoming: "Upcoming",
  past: "Archive",
} as const;

export default function ExhibitionCarousel() {
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const step = useCallback(() => {
    const el = rail.current;
    if (!el) return 0;
    const card = el.querySelector<HTMLElement>(`.${styles.card}`);
    return card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
  }, []);

  const syncProgress = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const ratio = max > 0 ? el.scrollLeft / max : 1;
    if (bar.current) gsap.set(bar.current, { scaleX: gsap.utils.clamp(0.06, 1, ratio) });
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft > max - 8);
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const to = el.scrollLeft + dir * step();
    if (prefersReducedMotion()) {
      el.scrollLeft = to;
      return;
    }
    gsap.to(el, { scrollTo: { x: to }, duration: 0.75, ease: "power3.inOut" });
  };

  useEffect(() => {
    syncProgress();
    const el = rail.current;
    el?.addEventListener("scroll", syncProgress, { passive: true });
    window.addEventListener("resize", syncProgress);
    return () => {
      el?.removeEventListener("scroll", syncProgress);
      window.removeEventListener("resize", syncProgress);
    };
  }, [syncProgress]);

  useGSAP(
    () => {
      const el = rail.current;
      if (!el) return;

      if (!prefersReducedMotion()) {
        gsap.fromTo(
          el.querySelectorAll(`.${styles.card}`),
          { opacity: 0, x: 70, rotate: 1.5 },
          {
            opacity: 1,
            x: 0,
            rotate: 0,
            duration: 0.95,
            stagger: 0.11,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          }
        );
      }

      if (!window.matchMedia("(pointer: fine)").matches) return;

      let down = false;
      let startX = 0;
      let startScroll = 0;

      const onDown = (e: PointerEvent) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        down = true;
        startX = e.clientX;
        startScroll = el.scrollLeft;
        el.classList.add(styles.dragging);
      };
      const onMove = (e: PointerEvent) => {
        if (!down) return;
        el.scrollLeft = startScroll - (e.clientX - startX);
      };
      const onUp = () => {
        down = false;
        el.classList.remove(styles.dragging);
      };

      el.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      return () => {
        el.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    },
    { scope: rail }
  );

  return (
    <div className={styles.carousel}>
      <div ref={rail} className={styles.rail} tabIndex={0} aria-label="Exhibitions carousel">
        {EXHIBITIONS.map((ex) => (
          <article key={ex.id} className={`${styles.card} plateHost`}>
            <Link href="/exhibitions" className={styles.cardLink} data-cursor="View">
              <span className={styles.cardPlate}>
                <ArtPlate variant={ex.plate} />
                <span className={`${styles.status} ${styles[ex.status]}`}>
                  {STATUS_LABEL[ex.status]}
                </span>
              </span>
              <span className={styles.cardBody}>
                <span className={styles.cardDate}>{ex.date}</span>
                <span className={styles.cardTitle}>{ex.title}</span>
                <span className={styles.cardVenue}>{ex.venue}</span>
                <span className={styles.cardBlurb}>{ex.blurb}</span>
                <span className={styles.cardMore}>
                  Learn more <ArrowIcon size={14} />
                </span>
              </span>
            </Link>
          </article>
        ))}
      </div>

      <div className={styles.controls}>
        <span className={styles.track}>
          <span ref={bar} className={styles.bar} />
        </span>
        <div className={styles.arrows}>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className={styles.arrow}
            disabled={atStart}
            aria-label="Previous exhibitions"
          >
            <ArrowIcon size={16} className={styles.flip} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className={styles.arrow}
            disabled={atEnd}
            aria-label="Next exhibitions"
          >
            <ArrowIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
