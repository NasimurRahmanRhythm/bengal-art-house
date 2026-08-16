"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { CloseIcon, PlusIcon } from "@/components/Icons";
import { formatBDT, type Artwork } from "@/data/artworks";
import { useCart } from "@/context/CartContext";
import styles from "./Artworks.module.css";

type Props = {
  artwork: Artwork | null;
  onClose: () => void;
};

export default function QuickView({ artwork, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const { add, has, openCart } = useCart();
  const open = Boolean(artwork);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const instant = prefersReducedMotion();
      const scrim = el.querySelector(`.${styles.qvScrim}`);
      const sheet = el.querySelector(`.${styles.qvSheet}`);

      if (open) {
        gsap.set(el, { pointerEvents: "auto", visibility: "visible" });
        gsap
          .timeline()
          .to(scrim, { opacity: 1, duration: instant ? 0 : 0.35 })
          .fromTo(
            sheet,
            { opacity: 0, y: 46, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: instant ? 0 : 0.7, ease: "power4.out" },
            0.05
          )
          .fromTo(
            el.querySelectorAll("[data-qv-line]"),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: instant ? 0 : 0.55, stagger: 0.06 },
            instant ? 0 : 0.24
          );
      } else {
        gsap
          .timeline({
            onComplete: () => gsap.set(el, { pointerEvents: "none", visibility: "hidden" }),
          })
          .to(sheet, { opacity: 0, y: 26, duration: instant ? 0 : 0.35, ease: "power2.in" })
          .to(scrim, { opacity: 0, duration: instant ? 0 : 0.3 }, 0);
      }
    },
    { dependencies: [open, artwork?.id] }
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const sold = artwork?.status === "sold";
  const inCart = artwork ? has(artwork.id) : false;

  return (
    <div ref={root} className={styles.qvRoot} aria-hidden={!open}>
      <button
        type="button"
        className={styles.qvScrim}
        onClick={onClose}
        aria-label="Close quick view"
        tabIndex={open ? 0 : -1}
      />

      <div className={styles.qvSheet} role="dialog" aria-modal="true" aria-label="Artwork detail">
        {artwork && (
          <>
            <div className={styles.qvPlate}>
              {artwork.photo ? (
                <Image
                  src={artwork.photo}
                  alt={`${artwork.title} by ${artwork.artist}`}
                  width={800}
                  height={1000}
                  className={styles.qvImg}
                />
              ) : (
                <ArtPlate variant={artwork.plate} />
              )}
            </div>

            <div className={styles.qvBody}>
              <button
                type="button"
                className={styles.qvClose}
                onClick={onClose}
                aria-label="Close quick view"
                tabIndex={open ? 0 : -1}
              >
                <CloseIcon size={17} />
              </button>

              <span className={styles.qvArtist} data-qv-line>
                {artwork.artist}
              </span>
              <h3 className={styles.qvTitle} data-qv-line>
                {artwork.title}
              </h3>
              <p className={styles.qvNote} data-qv-line>
                {artwork.note}
              </p>

              <dl className={styles.qvSpecs} data-qv-line>
                <div>
                  <dt>Medium</dt>
                  <dd>{artwork.medium}</dd>
                </div>
                <div>
                  <dt>Year</dt>
                  <dd>{artwork.year}</dd>
                </div>
                <div>
                  <dt>Dimensions</dt>
                  <dd>{artwork.dimensions}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{sold ? "Sold" : "Available"}</dd>
                </div>
              </dl>

              <div className={styles.qvFoot} data-qv-line>
                <span className={`${styles.qvPrice} ${sold ? styles.priceSold : ""}`}>
                  {formatBDT(artwork.price)}
                </span>
                <button
                  type="button"
                  className={styles.qvAdd}
                  disabled={sold}
                  onClick={() => {
                    if (sold) return;
                    if (!inCart) add(artwork);
                    onClose();
                    openCart();
                  }}
                  tabIndex={open ? 0 : -1}
                >
                  {sold ? "Sold" : inCart ? "In your selection" : <>Add to selection <PlusIcon size={13} /></>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
