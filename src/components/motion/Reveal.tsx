"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { revealOnce } from "@/lib/motion";
import styles from "./Reveal.module.css";

type Variant = "rise" | "fade" | "wipe" | "scale" | "fromLeft" | "fromRight";

type RevealProps = {
  children: ReactNode;
  variant?: Variant;
  stagger?: number;
  delay?: number;
  duration?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
};

export default function Reveal({
  children,
  variant = "rise",
  stagger,
  delay = 0,
  duration = 1,
  as: Tag = "div",
  className,
  style,
  id,
}: RevealProps) {
  const scope = useRef<HTMLElement>(null);
  const isStaggered = typeof stagger === "number";

  useEffect(() => {
    const root = scope.current;
    if (!root) return;

    const targets = isStaggered ? Array.from(root.children) : [root];
    targets.forEach((target, i) => {
      const el = target as HTMLElement;
      el.style.setProperty("--reveal-duration", `${duration}s`);
      el.style.setProperty(
        isStaggered ? "--item-delay" : "--reveal-delay",
        `${delay + (isStaggered ? i * (stagger ?? 0) : 0)}s`
      );
    });

    return revealOnce(root, () => {
      targets.forEach((target) => (target as HTMLElement).classList.add(styles.visible));
    });
  }, [isStaggered, stagger, delay, duration]);

  return (
    <Tag
      ref={scope}
      id={id}
      className={`${styles.reveal} ${styles[variant]} ${isStaggered ? styles.stagger : ""} ${className ?? ""}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
