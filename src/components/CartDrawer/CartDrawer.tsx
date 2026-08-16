"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useCart } from "@/context/CartContext";
import { formatBDT } from "@/data/artworks";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { ArrowIcon, CloseIcon } from "@/components/Icons";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const { lines, count, total, isOpen, closeCart, remove, clear } = useCart();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const scrim = el.querySelector(`.${styles.scrim}`);
      const sheet = el.querySelector(`.${styles.sheet}`);
      const rows = el.querySelectorAll("[data-cart-row]");
      const instant = prefersReducedMotion();

      if (isOpen) {
        gsap.set(el, { pointerEvents: "auto", visibility: "visible" });
        const tl = gsap.timeline();
        tl.to(scrim, { opacity: 1, duration: instant ? 0 : 0.4, ease: "power2.out" })
          .fromTo(
            sheet,
            { xPercent: 100 },
            { xPercent: 0, duration: instant ? 0 : 0.7, ease: "power4.out" },
            0
          )
          .fromTo(
            rows,
            { x: 40, opacity: 0 },
            { x: 0, opacity: 1, duration: instant ? 0 : 0.5, stagger: 0.07, ease: "power3.out" },
            instant ? 0 : 0.25
          );
      } else {
        gsap
          .timeline({
            onComplete: () => gsap.set(el, { pointerEvents: "none", visibility: "hidden" }),
          })
          .to(sheet, { xPercent: 100, duration: instant ? 0 : 0.45, ease: "power3.in" })
          .to(scrim, { opacity: 0, duration: instant ? 0 : 0.35 }, 0);
      }
    },
    { dependencies: [isOpen, lines.length] }
  );

  return (
    <div ref={root} className={styles.root} aria-hidden={!isOpen}>
      <button
        type="button"
        className={styles.scrim}
        onClick={closeCart}
        tabIndex={isOpen ? 0 : -1}
        aria-label="Close cart"
      />

      <aside
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Selected works"
      >
        <header className={styles.head}>
          <div>
            <span className={styles.headKicker}>Your selection</span>
            <h2 className={styles.headTitle}>
              {count} {count === 1 ? "work" : "works"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className={styles.close}
            aria-label="Close cart"
            tabIndex={isOpen ? 0 : -1}
          >
            <CloseIcon size={17} />
          </button>
        </header>

        <div className={styles.body}>
          {count === 0 ? (
            <div className={styles.empty} data-cart-row>
              <span className={styles.emptyMark}>—</span>
              <p>
                Nothing selected yet. Browse the works available for acquisition and add the ones
                you would like to enquire about.
              </p>
              <Link href="/artworks" className={styles.emptyLink} onClick={closeCart}>
                Explore artworks <ArrowIcon size={14} />
              </Link>
            </div>
          ) : (
            <ul className={styles.list}>
              {lines.map((line) => (
                <li key={line.id} className={styles.row} data-cart-row>
                  <span className={styles.thumb}>
                    {line.photo ? (
                      <Image src={line.photo} alt="" width={140} height={175} />
                    ) : (
                      <ArtPlate variant={line.plate} />
                    )}
                  </span>
                  <span className={styles.rowBody}>
                    <span className={styles.rowArtist}>{line.artist}</span>
                    <span className={styles.rowTitle}>{line.title}</span>
                    <span className={styles.rowPrice}>{formatBDT(line.price)}</span>
                  </span>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => remove(line.id)}
                    aria-label={`Remove ${line.title}`}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <CloseIcon size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {count > 0 && (
          <footer className={styles.foot}>
            <div className={styles.totalRow}>
              <span>Indicative total</span>
              <strong>{formatBDT(total)}</strong>
            </div>
            <p className={styles.footNote}>
              Prices are indicative and confirmed on enquiry. Every acquisition is backed by the
              gallery&apos;s provenance and authentication service.
            </p>
            <Link href="/contact" className={styles.enquire} onClick={closeCart}>
              Enquire about these works <ArrowIcon size={15} />
            </Link>
            <button type="button" className={styles.clear} onClick={clear}>
              Clear selection
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
