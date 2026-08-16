"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion, whenFontsReady } from "@/lib/gsap";
import { introDone } from "@/lib/intro";
import { SITE } from "@/data/site";
import { EXHIBITIONS } from "@/data/gallery";
import { ArrowIcon } from "@/components/Icons";
import Magnetic from "@/components/motion/Magnetic";
import Counter from "@/components/motion/Counter";
import styles from "./Hero.module.css";

const onView = EXHIBITIONS.find((e) => e.status === "current") ?? EXHIBITIONS[0];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(el.querySelectorAll("[data-reveal]"), { opacity: 1 });
        return;
      }

      let split: SplitText | null = null;
      let cancelled = false;

      const cancelFonts = whenFontsReady(() => {
        // Hold the type back until the intro curtain has lifted.
        introDone.then(() => {
          if (cancelled || !root.current) return;

          const title = q("[data-hero-title]")[0] as HTMLElement;
          split = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "heroLine" });
          gsap.set(title, { opacity: 1 });

          const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

          tl.fromTo(
            q("[data-hero-rule]"),
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.8 }
          )
            .fromTo(
              q("[data-hero-eyebrow]"),
              { opacity: 0, x: -14 },
              { opacity: 1, x: 0, duration: 0.7 },
              "-=0.55"
            )
            .fromTo(
              split.lines,
              { yPercent: 118, rotate: 3 },
              { yPercent: 0, rotate: 0, duration: 1.25, stagger: 0.1 },
              "-=0.45"
            )
            .fromTo(
              q("[data-hero-lede]"),
              { opacity: 0, y: 26 },
              { opacity: 1, y: 0, duration: 0.9 },
              "-=0.85"
            )
            .fromTo(
              q("[data-hero-cta] > *"),
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
              "-=0.6"
            )
            .fromTo(
              q("[data-hero-stat]"),
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
              "-=0.5"
            )
            .fromTo(
              q("[data-hero-figure]"),
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut" },
              0.35
            )
            .fromTo(
              q("[data-hero-img]"),
              { scale: 1.28, yPercent: 8 },
              { scale: 1, yPercent: 0, duration: 1.8, ease: "power3.out" },
              0.35
            )
            .fromTo(
              q("[data-hero-shape]"),
              { opacity: 0, scale: 0.5, rotate: -30 },
              { opacity: 1, scale: 1, rotate: 0, duration: 1.1, stagger: 0.12 },
              "-=1.1"
            )
            .fromTo(
              q("[data-hero-banner]"),
              { opacity: 0, y: 34 },
              { opacity: 1, y: 0, duration: 0.9 },
              "-=0.8"
            );

          // Endless drift on the floating marks.
          q("[data-hero-shape]").forEach((shape, i) => {
            gsap.to(shape, {
              y: i % 2 === 0 ? 18 : -22,
              x: i % 2 === 0 ? -10 : 12,
              rotate: i % 2 === 0 ? 8 : -6,
              duration: 6 + i * 1.4,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });
          });

          // Scroll cue breathing.
          gsap.to(q("[data-hero-cue] span"), {
            yPercent: 180,
            duration: 1.6,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 0.35,
          });
        });
      });

      // Depth on scroll: text lifts a little faster than the plate.
      gsap.to(q("[data-hero-copy]"), {
        yPercent: -14,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(q("[data-hero-img]"), {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
      });

      // Pointer parallax across the whole stage.
      const onMove = (e: PointerEvent) => {
        const rx = e.clientX / window.innerWidth - 0.5;
        const ry = e.clientY / window.innerHeight - 0.5;
        gsap.to(q("[data-hero-figure]"), { x: rx * -18, y: ry * -14, duration: 1.1 });
        gsap.to(q("[data-hero-shape]"), { x: rx * 34, y: ry * 26, duration: 1.4 });
      };
      if (window.matchMedia("(pointer: fine)").matches) {
        el.addEventListener("pointermove", onMove);
      }

      return () => {
        cancelled = true;
        cancelFonts();
        el.removeEventListener("pointermove", onMove);
        split?.revert();
      };
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.hero}>
      <span className={styles.grain} aria-hidden="true" />

      <div className={`wrap ${styles.grid}`}>
        <div className={styles.copy} data-hero-copy>
          <div className={styles.eyebrow}>
            <span className={styles.rule} data-hero-rule />
            <span data-hero-eyebrow>{SITE.established}</span>
          </div>

          <h1 className={styles.title} data-hero-title data-reveal>
            Form carved <em>from</em> silence &amp; steel.
          </h1>

          <p className={styles.lede} data-hero-lede data-reveal>
            {SITE.name} holds the sculpture, drawings and public works of a growing circle of
            Bangladeshi artists — carrying forward the modern sculpture tradition brought into the
            country&apos;s parks, campuses and public memory by pioneers like{" "}
            <strong>Hamiduzzaman Khan</strong>.
          </p>

          <div className={styles.ctaRow} data-hero-cta>
            <Magnetic>
              <Link href="/artworks" className={styles.primaryBtn} data-cursor="link">
                Explore the works <ArrowIcon size={15} />
              </Link>
            </Magnetic>
            <Magnetic strength={12}>
              <Link href="/exhibitions" className={styles.ghostBtn} data-cursor="link">
                What&apos;s on view
              </Link>
            </Magnetic>
          </div>

          <dl className={styles.stats}>
            <div data-hero-stat data-reveal>
              <dt className={styles.statNum}>
                <Counter value={3} />
              </dt>
              <dd className={styles.statLbl}>Artists represented</dd>
            </div>
            <div data-hero-stat data-reveal>
              <dt className={styles.statNum}>
                <Counter value={4} />
              </dt>
              <dd className={styles.statLbl}>Countries exhibited</dd>
            </div>
            <div data-hero-stat data-reveal>
              <dt className={styles.statNum}>
                <Counter value={5} />
              </dt>
              <dd className={styles.statLbl}>Decades of practice</dd>
            </div>
          </dl>
        </div>

        <div className={styles.stage}>
          <span className={`${styles.shape} ${styles.shapeA}`} data-hero-shape aria-hidden="true" />
          <span className={`${styles.shape} ${styles.shapeB}`} data-hero-shape aria-hidden="true" />
          <span className={`${styles.shape} ${styles.shapeC}`} data-hero-shape aria-hidden="true" />

          <figure className={styles.figure} data-hero-figure data-reveal>
            <span className={styles.figureInner}>
              <Image
                src="/images/sculpture.jpg"
                alt="Abstract standing sculpture in oxidised red by Hamiduzzaman Khan"
                width={900}
                height={900}
                priority
                sizes="(max-width: 900px) 80vw, 42vw"
                className={styles.figureImg}
                data-hero-img
              />
            </span>
            <figcaption className={styles.caption}>
              <span>Untitled standing form</span>
              <span>Hamiduzzaman Khan</span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Now-on-view banner, pinned to the base of the hero */}
      <div className={`wrap ${styles.bannerWrap}`}>
        <Link href="/exhibitions" className={styles.banner} data-hero-banner data-reveal>
          <span className={styles.bannerTag}>Now on view</span>
          <span className={styles.bannerTitle}>{onView.title}</span>
          <span className={styles.bannerMeta}>{onView.date}</span>
          <span className={styles.bannerLink}>
            See more <ArrowIcon size={14} />
          </span>
        </Link>
      </div>

      <span className={styles.cue} data-hero-cue aria-hidden="true">
        <span />
      </span>
    </section>
  );
}
