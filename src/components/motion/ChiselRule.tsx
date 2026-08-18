"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, revealOnce } from "@/lib/motion";
import styles from "./ChiselRule.module.css";

const POINTS =
  "0,7 60,3 120,10 180,4 240,8 300,3 360,9 420,5 480,10 540,4 600,8 660,3 720,9 780,5 840,10 900,4 960,8 1020,3 1080,9 1140,5 1200,7";

type ChiselRuleProps = {
  tone?: "dark" | "light" | "oxide";
  className?: string;
};

export default function ChiselRule({ tone = "dark", className }: ChiselRuleProps) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrap.current;
    const line = root?.querySelector("polyline");
    if (!root || !line) return;

    const length = line.getTotalLength();
    line.style.strokeDasharray = `${length}`;
    line.style.strokeDashoffset = `${length}`;
    if (!prefersReducedMotion()) {
      line.style.transition = "stroke-dashoffset 1.6s var(--ease-in-out)";
    }

    return revealOnce(
      root,
      () => {
        line.style.strokeDashoffset = "0";
      },
      { threshold: 0 }
    );
  }, []);

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
