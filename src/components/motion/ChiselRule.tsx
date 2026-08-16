"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import styles from "./ChiselRule.module.css";

const POINTS =
  "0,7 60,3 120,10 180,4 240,8 300,3 360,9 420,5 480,10 540,4 600,8 660,3 720,9 780,5 840,10 900,4 960,8 1020,3 1080,9 1140,5 1200,7";

type ChiselRuleProps = {
  tone?: "dark" | "light" | "oxide";
  className?: string;
};

export default function ChiselRule({ tone = "dark", className }: ChiselRuleProps) {
  const wrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const line = wrap.current?.querySelector("polyline");
      if (!line || prefersReducedMotion()) return;

      const length = line.getTotalLength();
      gsap.fromTo(
        line,
        { strokeDasharray: length, strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: "power2.inOut",
          scrollTrigger: { trigger: wrap.current, start: "top 95%", once: true },
        }
      );
    },
    { scope: wrap }
  );

  return (
    <div
      ref={wrap}
      className={`${styles.rule} ${styles[tone]} ${className ?? ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 14" preserveAspectRatio="none">
        <polyline points={POINTS} fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
