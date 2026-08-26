"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { FOOTER_EXPLORE, SITE, SOCIALS } from "@/data/site";
import { SOCIAL_ICONS, ArrowIcon } from "@/components/Icons";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";
import Magnetic from "@/components/motion/Magnetic";
import styles from "./Footer.module.css";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const row = root.current?.querySelector<HTMLElement>(`.${styles.markRow}`);
      const track = root.current?.querySelector<HTMLElement>(`.${styles.markTrack}`);
      if (!row || !track || prefersReducedMotion()) return;

      const tween = gsap.fromTo(
        track,
        { xPercent: -50 },
        { xPercent: 0, ease: "none", duration: 24, repeat: -1, paused: true },
      );

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) tween.play();
          else tween.pause();
        },
        { threshold: 0 },
      );
      observer.observe(row);

      return () => observer.disconnect();
    },
    { scope: root },
  );

  return (
    <footer ref={root} className={styles.footer} id="contact">
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.ctaCol}>
            <span className="kicker">Contact</span>
            <SplitHeading as="h2" className={styles.ctaTitle}>
              Visit the gallery, or arrange a{" "}
              <em className="em">private viewing.</em>
            </SplitHeading>
            <Reveal delay={0.15}>
              <p className={styles.ctaBody}>
                {SITE.name} hosts exhibitions and private cultural events, with
                proceeds supporting continued documentation of Bangladesh&apos;s
                public sculpture.
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
          <div className={styles.markTrack}>
            <span className={styles.markGroup}>
              <span className={styles.bigMark}>GALLERY HAMIDUZZAMAN</span>
            </span>
            <span className={styles.markGroup}>
              <span className={styles.bigMark}>GALLERY HAMIDUZZAMAN</span>
            </span>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>
            © {new Date().getFullYear()} {SITE.name}
          </span>
          <span>{SITE.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
