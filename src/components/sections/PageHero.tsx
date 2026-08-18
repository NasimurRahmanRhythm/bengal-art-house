"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import SplitHeading from "@/components/motion/SplitHeading";
import Reveal from "@/components/motion/Reveal";
import styles from "./Sections.module.css";

type PageHeroProps = {
  kicker: string;
  title: React.ReactNode;
  lede: string;
  crumbs?: { label: string; href: string }[];
  meta?: { label: string; value: string }[];
};

export default function PageHero({ kicker, title, lede, crumbs = [], meta = [] }: PageHeroProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to(root.current?.querySelector(`.${styles.hatch}`) ?? [], {
        backgroundPositionX: "120px",
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1 },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.pageHero}>
      <span className={styles.hatch} aria-hidden="true" />

      <div className={`wrap ${styles.pageHeroInner}`}>
        {crumbs.length > 0 && (
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            {crumbs.map((c) => (
              <Link key={c.href} href={c.href}>
                {c.label}
              </Link>
            ))}
            <span aria-hidden="true">/</span>
          </nav>
        )}

        <span className="kicker">{kicker}</span>

        <div className={styles.pageHeroGrid}>
          <SplitHeading as="h1" className={styles.pageTitle}>
            {title}
          </SplitHeading>

          <div>
            <Reveal delay={0.2}>
              <p className={styles.pageLede}>{lede}</p>
            </Reveal>

            {meta.length > 0 && (
              <Reveal className={styles.pageMeta} stagger={0.08} delay={0.3}>
                {meta.map((m) => (
                  <div key={m.label}>
                    <span className={styles.metaValue}>{m.value}</span>
                    <span className={styles.metaLabel}>{m.label}</span>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
