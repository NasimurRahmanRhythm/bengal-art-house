"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { FOOTER_EXPLORE, FOOTER_POLICY, SITE, SOCIALS } from "@/data/site";
import { SOCIAL_ICONS, ArrowIcon } from "@/components/Icons";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";
import Magnetic from "@/components/motion/Magnetic";
import styles from "./Footer.module.css";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mark = root.current?.querySelector(`.${styles.bigMark}`);
      if (!mark || prefersReducedMotion()) return;

      // The giant wordmark slides sideways as the footer scrolls into frame.
      gsap.fromTo(
        mark,
        { xPercent: -6, opacity: 0.5 },
        {
          xPercent: 3,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 0.7 },
        }
      );
    },
    { scope: root }
  );

  return (
    <footer ref={root} className={styles.footer} id="contact">
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.ctaCol}>
            <span className="kicker">Contact</span>
            <SplitHeading as="h2" className={styles.ctaTitle}>
              Visit the gallery, or arrange a <em className="em">private viewing.</em>
            </SplitHeading>
            <Reveal delay={0.15}>
              <p className={styles.ctaBody}>
                {SITE.name} hosts exhibitions and private cultural events, with proceeds
                supporting continued documentation of Bangladesh&apos;s public sculpture.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <Magnetic>
                <Link href="/contact" className={styles.ctaBtn}>
                  Plan your visit <ArrowIcon size={15} />
                </Link>
              </Magnetic>
            </Reveal>
          </div>

          <Reveal className={styles.col} stagger={0.08}>
            <span className={styles.colLabel}>Contact</span>
            <a href={`mailto:${SITE.email}`} className={styles.colLink}>
              {SITE.email}
            </a>
            <a href={`tel:${SITE.phoneHref}`} className={styles.colLink}>
              {SITE.phone}
            </a>
            <p className={styles.colText}>{SITE.address}</p>
            <div className={styles.socials}>
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICONS[s.icon];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    className={styles.socialLink}
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </Reveal>

          <Reveal className={styles.col} stagger={0.08}>
            <span className={styles.colLabel}>Explore</span>
            {FOOTER_EXPLORE.map((l) => (
              <Link key={l.label} href={l.href} className={styles.colLink}>
                {l.label}
              </Link>
            ))}
          </Reveal>
        </div>

        <div className={styles.markRow} aria-hidden="true">
          <span className={styles.bigMark}>BENGAL ART HOUSE</span>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <nav className={styles.policy} aria-label="Policies">
            {FOOTER_POLICY.map((l) => (
              <Link key={l.label} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
          <span>{SITE.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
