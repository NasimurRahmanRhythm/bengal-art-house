"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { BIO, FACTS } from "@/data/gallery";
import { ArrowIcon } from "@/components/Icons";
import SplitHeading from "@/components/motion/SplitHeading";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import styles from "./Sections.module.css";

export default function AboutSculptor() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const bar = root.current?.querySelector(`.${styles.quoteBar}`);
      if (!bar) return;

      gsap.fromTo(
        bar,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.1,
          ease: "power3.inOut",
          scrollTrigger: { trigger: bar, start: "top 86%", once: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className={`${styles.dark} onDark`} id="featured-artist">
      <div className={`wrap ${styles.aboutGrid}`}>
        <div>
          <span className="kicker">Featured Artist</span>
          <SplitHeading as="h2" className={styles.aboutName}>
            Hamiduzzaman Khan
          </SplitHeading>

          <Reveal delay={0.15}>
            <blockquote className={styles.quote}>
              <span className={styles.quoteBar} aria-hidden="true" />
              “He brought emotion, story and silence into steel and stone.”
            </blockquote>
          </Reveal>

          <Reveal className={styles.facts} stagger={0.09} delay={0.25}>
            {FACTS.map((f) => (
              <div key={f.label} className={styles.fact}>
                <span className={styles.factLabel}>{f.label}</span>
                <span className={styles.factValue}>{f.value}</span>
              </div>
            ))}
          </Reveal>
        </div>

        <div>
          <Reveal stagger={0.12}>
            {BIO.map((para) => (
              <p key={para.slice(0, 24)} className={styles.bioPara}>
                {para}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.2}>
            <Magnetic>
              <Link href="/artists/hamiduzzaman-khan" className={styles.darkBtn}>
                Read the full biography <ArrowIcon size={15} />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
