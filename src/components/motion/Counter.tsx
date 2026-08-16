"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type CounterProps = {
  value: number;
  /** Rendered before/after the number, e.g. "+" or "yr". */
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
};

/** Counts up to `value` once it scrolls into view. */
export default function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.8,
  delay = 0,
  className,
}: CounterProps) {
  const el = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const node = el.current;
      if (!node) return;

      if (prefersReducedMotion()) {
        node.textContent = `${prefix}${value}${suffix}`;
        return;
      }

      const counter = { n: 0 };
      gsap.to(counter, {
        n: value,
        duration,
        delay,
        ease: "power2.out",
        snap: { n: 1 },
        onUpdate: () => {
          node.textContent = `${prefix}${Math.round(counter.n)}${suffix}`;
        },
        scrollTrigger: { trigger: node, start: "top 92%", once: true },
      });
    },
    { scope: el, dependencies: [value, suffix, prefix, duration, delay] }
  );

  return (
    <span ref={el} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
