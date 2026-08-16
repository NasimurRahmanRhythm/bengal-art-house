"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion, whenFontsReady } from "@/lib/gsap";

type SplitHeadingProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
  delay?: number;
  /** Skip ScrollTrigger and play as soon as the fonts are ready (hero use). */
  immediate?: boolean;
  start?: string;
  /** Split into words rather than whole lines — for short, punchy headings. */
  by?: "lines" | "words";
};

/**
 * Editorial heading reveal: the text is sliced into masked lines that swing up
 * from below their own baseline, one after the next.
 */
export default function SplitHeading({
  children,
  as: Tag = "h2",
  className,
  style,
  id,
  delay = 0,
  immediate = false,
  start = "top 88%",
  by = "lines",
}: SplitHeadingProps) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      let split: SplitText | null = null;

      const cancelFonts = whenFontsReady(() => {
        if (!scope.current) return;

        split = SplitText.create(el, {
          type: by,
          mask: by,
          linesClass: "splitLine",
          wordsClass: "splitWord",
        });

        const parts = by === "lines" ? split.lines : split.words;
        gsap.set(el, { opacity: 1 });

        gsap.fromTo(
          parts,
          { yPercent: 118, rotate: by === "words" ? 4 : 2 },
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.15,
            delay,
            ease: "expo.out",
            stagger: 0.085,
            scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
          }
        );

        ScrollTrigger.refresh();
      });

      return () => {
        cancelFonts();
        split?.revert();
      };
    },
    { scope, dependencies: [delay, immediate, start, by] }
  );

  return (
    <Tag ref={scope} id={id} className={className} style={style} data-reveal="">
      {children}
    </Tag>
  );
}
