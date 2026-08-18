"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type ParallaxProps = {
  children: ReactNode;
  /** Positive drifts down as you scroll, negative drifts up. */
  amount?: number;
  className?: string;
  style?: CSSProperties;
};

/** Scroll-linked vertical drift, scrubbed rather than triggered. */
export default function Parallax({ children, amount = -70, className, style }: ParallaxProps) {
  const el = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!el.current || prefersReducedMotion()) return;

      gsap.fromTo(
        el.current,
        { y: -amount / 2 },
        {
          y: amount / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );
    },
    { scope: el, dependencies: [amount] }
  );

  return (
    <div ref={el} className={className} style={style}>
      {children}
    </div>
  );
}
