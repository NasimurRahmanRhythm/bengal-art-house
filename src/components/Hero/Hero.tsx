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
              { yPercent: 112, rotate: 2 },
              { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.09 },
              "-=0.45"
            )
            .fromTo(
              q("[data-hero-lede]"),
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.8 },
              "-=0.8"
            )
            .fromTo(
              q("[data-hero-cta] > *"),
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
              "-=0.55"
            )
            .fromTo(
              q("[data-hero-figure]"),
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power4.inOut" },
              0.3
            )
            .fromTo(
              q("[data-hero-img]"),
              { scale: 1.16, yPercent: 5 },
              { scale: 1, yPercent: 0, duration: 1.6, ease: "power3.out" },
              0.3
            )
            .fromTo(
              q("[data-hero-shape]"),
              { opacity: 0, scale: 0.6 },
              { opacity: 1, scale: 1, duration: 1, stagger: 0.12 },
              "-=1"
            )
            .fromTo(
              q("[data-hero-banner]"),
              { opacity: 0, y: 26 },
              { opacity: 1, y: 0, duration: 0.8 },
              "-=0.65"
            );

          gsap.to(q("[data-hero-cue] span"), {
            yPercent: 180,
            duration: 1.6,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 0.35,
          });
        });
      });

      gsap.to(q("[data-hero-img]"), {
        yPercent: 7,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
      });

      return () => {
        cancelled = true;
        cancelFonts();
        split?.revert();
      };
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.hero}>
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
            <Magnetic strength={10}>
              <Link href="/artworks" className={styles.primaryBtn} data-cursor="link">
                Explore the works <ArrowIcon size={15} />
              </Link>
            </Magnetic>
            <Link href="/exhibitions" className={styles.textLink} data-cursor="link">
              What&apos;s on view <ArrowIcon size={14} />
            </Link>
          </div>
        </div>

        <div className={styles.stage}>
          <span className={`${styles.shape} ${styles.shapeA}`} data-hero-shape aria-hidden="true" />
          <span className={`${styles.shape} ${styles.shapeB}`} data-hero-shape aria-hidden="true" />

          <figure className={styles.figure} data-hero-figure data-reveal>
            <span className={styles.figureInner}>
              <Image
                src="/images/sculpture.jpg"
                alt="Abstract standing sculpture in oxidised red by Hamiduzzaman Khan"
                width={900}
                height={1125}
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
