"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import styles from "./Marquee.module.css";

type MarqueeProps = {
  items: readonly string[];
  speed?: number;
  tone?: "light" | "dark";
};

export default function Marquee({ items, speed = 26, tone = "light" }: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current?.querySelector(`.${styles.track}`);
      if (!track || prefersReducedMotion()) return;

      const loop = gsap.to(track, {
        xPercent: -50,
        duration: speed,
        ease: "none",
        repeat: -1,
      });

      const trigger = ScrollTrigger.create({
        onUpdate: (self) => {
          const dir = self.direction;
          gsap.to(loop, {
            timeScale: dir * gsap.utils.clamp(1, 4, 1 + Math.abs(self.getVelocity()) / 900),
            duration: 0.4,
            overwrite: true,
          });
        },
      });

      return () => {
        trigger.kill();
        loop.kill();
      };
    },
    { scope: root, dependencies: [speed] }
  );

  const run = [...items, ...items];

  return (
    <div ref={root} className={`${styles.marquee} ${styles[tone]}`} aria-hidden="true">
      <div className={styles.track}>
        {run.map((item, i) => (
          <span key={`${item}-${i}`} className={styles.item}>
            {item}
            <span className={styles.dot} />
          </span>
        ))}
      </div>
    </div>
  );
}
