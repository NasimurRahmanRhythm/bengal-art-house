"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ArrowIcon } from "@/components/Icons";
import SplitHeading from "@/components/motion/SplitHeading";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import styles from "./Sections.module.css";

export default function ParkBanner() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      gsap.to(el.querySelectorAll("[data-park-form]"), {
        yPercent: -22,
        ease: "none",
        stagger: 0.2,
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.park} id="park">
      <div className={styles.parkForms} aria-hidden="true">
        <span data-park-form className={`${styles.parkForm} ${styles.parkFormA}`} />
        <span data-park-form className={`${styles.parkForm} ${styles.parkFormB}`} />
        <span data-park-form className={`${styles.parkForm} ${styles.parkFormC}`} />
        <span data-park-form className={`${styles.parkForm} ${styles.parkFormD}`} />
      </div>

      <div className={`wrap ${styles.parkInner}`}>
        <span className="kicker">The Legacy</span>
        <SplitHeading as="h2" className={styles.parkTitle}>
          Hamiduzzaman Sculpture Park
        </SplitHeading>
        <Reveal delay={0.15}>
          <p className={styles.parkBody}>
            An open-air home for his abstract and semi-abstract works in iron, stone, granite and
            steel wire — carrying forward the themes of Liberation, folk culture and the human face
            that ran through his life&apos;s work.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <Magnetic>
            <Link href="/contact" className={styles.parkBtn} data-cursor="link">
              Plan a visit <ArrowIcon size={15} />
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
