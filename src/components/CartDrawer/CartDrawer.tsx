"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatBDT } from "@/data/artworks";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { ArrowIcon, CloseIcon } from "@/components/Icons";
import styles from "./CartDrawer.module.css";

const itemDelay = (i: number) => ({ "--i": i }) as CSSProperties;

export default function CartDrawer() {
  const { lines, count, total, isOpen, closeCart, remove, clear } = useCart();

  return (
    <div className={`${styles.root} ${isOpen ? styles.open : ""}`} inert={!isOpen}>
      <button
        type="button"
        className={styles.scrim}
        onClick={closeCart}
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
          >
            <CloseIcon size={17} />
          </button>
        </header>

        <div className={styles.body}>
          {count === 0 ? (
            <div className={styles.empty} style={itemDelay(0)}>
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
              {lines.map((line, i) => (
                <li key={line.id} className={styles.row} style={itemDelay(i)}>
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
