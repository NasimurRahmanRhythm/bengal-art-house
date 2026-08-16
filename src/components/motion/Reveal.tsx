"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type Variant = "rise" | "fade" | "wipe" | "scale" | "fromLeft" | "fromRight";

/**
 * Every variant declares both ends of the tween. The CSS baseline hides
 * `[data-reveal]` elements up front, so an open-ended `from()` would read that
 * `opacity: 0` back as the destination — `fromTo` keeps the target explicit.
 */
const VARIANTS: Record<Variant, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
  rise: { from: { y: 46, opacity: 0 }, to: { y: 0, opacity: 1 } },
  fade: { from: { opacity: 0 }, to: { opacity: 1 } },
  wipe: {
    from: { opacity: 0, y: 26, clipPath: "inset(0% 0% 100% 0%)" },
    to: { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" },
  },
  scale: {
    from: { opacity: 0, scale: 0.94, filter: "blur(8px)" },
    to: { opacity: 1, scale: 1, filter: "blur(0px)" },
  },
  fromLeft: { from: { opacity: 0, x: -54 }, to: { opacity: 1, x: 0 } },
  fromRight: { from: { opacity: 0, x: 54 }, to: { opacity: 1, x: 0 } },
};

type RevealProps = {
  children: ReactNode;
  /** Motion flavour for the reveal. */
  variant?: Variant;
  /** Animate direct children one after another instead of the wrapper itself. */
  stagger?: number;
  delay?: number;
  duration?: number;
  /** ScrollTrigger `start` value. */
  start?: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
};

/**
 * Scroll-triggered entrance for a block of content.
 *
 * With `stagger`, the wrapper's direct children animate in sequence — which is
 * what every card grid on the site uses.
 */
export default function Reveal({
  children,
  variant = "rise",
  stagger,
  delay = 0,
  duration = 1,
  start = "top 85%",
  as: Tag = "div",
  className,
  style,
  id,
}: RevealProps) {
  const scope = useRef<HTMLElement>(null);
  const isStaggered = typeof stagger === "number";

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const targets: gsap.TweenTarget = isStaggered ? Array.from(root.children) : root;
      const { from, to } = VARIANTS[variant];

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1 });
        return;
      }

      gsap.fromTo(targets, from, {
        ...to,
        duration,
        delay,
        stagger: isStaggered ? stagger : 0,
        clearProps: "filter,clipPath,willChange",
        scrollTrigger: { trigger: root, start, once: true },
      });
    },
    { scope, dependencies: [variant, stagger, delay, duration, start] }
  );

  return (
    <Tag
      ref={scope}
      id={id}
      className={className}
      style={style}
      {...(isStaggered ? { "data-reveal-stagger": "" } : { "data-reveal": "" })}
    >
      {children}
    </Tag>
  );
}
