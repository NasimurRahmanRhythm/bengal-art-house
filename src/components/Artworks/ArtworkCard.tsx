"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { EyeIcon, PlusIcon } from "@/components/Icons";
import { formatBDT, type Artwork } from "@/data/artworks";
import { useCart } from "@/context/CartContext";
import styles from "./Artworks.module.css";

type Props = {
  artwork: Artwork;
  onQuickView: (artwork: Artwork) => void;
};

export default function ArtworkCard({ artwork, onQuickView }: Props) {
  const card = useRef<HTMLElement>(null);
  const { add, has } = useCart();

  const sold = artwork.status === "sold";
  const inCart = has(artwork.id);

  useGSAP(
    () => {
      const el = card.current;
      if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;

      const rotX = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
      const rotY = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        rotX((0.5 - (e.clientY - b.top) / b.height) * 7);
        rotY(((e.clientX - b.left) / b.width - 0.5) * 7);
      };
      const onLeave = () => {
        rotX(0);
        rotY(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: card }
  );

  const handleAdd = () => {
    if (sold || inCart) return;
    add(artwork);
    if (!prefersReducedMotion() && card.current) {
      gsap.fromTo(
        card.current.querySelector(`.${styles.thumb}`),
        { scale: 1 },
        { scale: 0.965, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.inOut" }
      );
    }
  };

  return (
    <article ref={card} className={`${styles.card} plateHost`} data-cursor="View">
      <div className={styles.thumb}>
        {artwork.photo ? (
          <Image
            src={artwork.photo}
            alt={`${artwork.title} by ${artwork.artist}`}
            width={600}
            height={750}
            sizes="(max-width: 700px) 90vw, (max-width: 1080px) 45vw, 30vw"
            className={styles.thumbImg}
          />
        ) : (
          <ArtPlate variant={artwork.plate} />
        )}

        {sold && <span className={styles.soldBadge}>Sold</span>}

        <div className={styles.overlay}>
          <button
            type="button"
            className={styles.quickBtn}
            onClick={() => onQuickView(artwork)}
            data-cursor="link"
          >
            <EyeIcon size={15} /> Quick view
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <span className={styles.artist}>{artwork.artist}</span>
        <h3 className={styles.title}>{artwork.title}</h3>
        <p className={styles.medium}>{artwork.medium}</p>

        <div className={styles.foot}>
          <span className={`${styles.price} ${sold ? styles.priceSold : ""}`}>
            {formatBDT(artwork.price)}
          </span>
          <button
            type="button"
            className={`${styles.addBtn} ${inCart ? styles.addBtnDone : ""}`}
            onClick={handleAdd}
            disabled={sold}
            data-cursor="link"
            aria-label={
              sold ? `${artwork.title} is sold` : `Add ${artwork.title} to your selection`
            }
          >
            {sold ? "Sold" : inCart ? "Added ✓" : <>Add <PlusIcon size={13} /></>}
          </button>
        </div>
      </div>
    </article>
  );
}
