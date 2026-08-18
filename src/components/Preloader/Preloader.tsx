"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { finishIntro } from "@/lib/intro";
import styles from "./Preloader.module.css";

const SESSION_KEY = "gh_intro_played";
const COLUMNS = 6;
const WORD = "HAMIDUZZAMAN";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      let seen = false;
      try {
        seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {}

      if (seen || prefersReducedMotion()) {
        gsap.set(el, { display: "none" });
        finishIntro();
        return;
      }

      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}

      document.body.style.overflow = "hidden";

      const num = { n: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          gsap.set(el, { display: "none" });
          ScrollTrigger.refresh();
          finishIntro();
        },
      });

      tl.from(el.querySelectorAll("[data-intro-letter]"), {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        stagger: 0.035,
        ease: "expo.out",
      })
        .from(
          el.querySelector(`.${styles.meta}`),
          { opacity: 0, duration: 0.6 },
          "-=0.55",
        )
        .to(
          num,
          {
            n: 100,
            duration: 1.35,
            ease: "power2.inOut",
            onUpdate: () => {
              if (counter.current) {
                counter.current.textContent = String(
                  Math.round(num.n),
                ).padStart(3, "0");
              }
            },
          },
          0.25,
        )
        .fromTo(
          el.querySelector(`.${styles.bar}`),
          { scaleX: 0 },
          { scaleX: 1, duration: 1.35, ease: "power2.inOut" },
          0.25,
        )
        .to(el.querySelector(`.${styles.content}`), {
          opacity: 0,
          y: -22,
          duration: 0.45,
          ease: "power2.in",
        })
        .to(
          el.querySelectorAll("[data-intro-col]"),
          {
            yPercent: -100,
            duration: 1.05,
            stagger: 0.07,
            ease: "power4.inOut",
          },
          "-=0.2",
        );
    },
    { scope: root },
  );

  return (
    <div ref={root} className={styles.root} aria-hidden="true">
      <div className={styles.columns}>
        {Array.from({ length: COLUMNS }, (_, i) => (
          <span key={i} data-intro-col className={styles.column} />
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.word}>
          <span className={styles.wordTop}>Gallery</span>
          <span className={styles.letters}>
            {WORD.split("").map((ch, i) => (
              <span key={i} className={styles.letterMask}>
                <span data-intro-letter className={styles.letter}>
                  {ch}
                </span>
              </span>
            ))}
          </span>
        </div>

        <div className={styles.meta}>
          <span>Dhaka · Est. 2026</span>
          <span ref={counter} className={styles.counter}>
            000
          </span>
        </div>
        <span className={styles.bar} />
      </div>
    </div>
  );
}
