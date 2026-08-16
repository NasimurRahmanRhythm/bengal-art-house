"use client";

import Link from "next/link";
import { ArrowIcon } from "@/components/Icons";
import Reveal from "@/components/motion/Reveal";
import styles from "./Sections.module.css";

const LINKS = [
  { kicker: "Shop", title: "Explore Art", href: "/artworks", note: "Sculpture, editions & drawings" },
  { kicker: "On View", title: "Exhibitions", href: "/exhibitions", note: "Current, upcoming & archive" },
  { kicker: "Abroad", title: "Collaborations", href: "/collaborations", note: "Baroda, Seoul, Europe" },
  { kicker: "Support", title: "Services", href: "/services", note: "Advisory, conservation, valuation" },
];

/** Four doors into the rest of the site. */
export default function QuickLinks() {
  return (
    <section className="section">
      <div className="wrap">
        <Reveal className={styles.quickGrid} stagger={0.1} variant="wipe">
          {LINKS.map((l, i) => (
            <Link key={l.title} href={l.href} className={styles.quickCard} data-cursor="link">
              <span className={styles.quickIndex}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.quickKicker}>{l.kicker}</span>
              <span className={styles.quickTitle}>
                {l.title}
                <ArrowIcon size={17} />
              </span>
              <span className={styles.quickNote}>{l.note}</span>
              <span className={styles.quickFill} aria-hidden="true" />
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
