"use client";

import { useRef, type ReactElement } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

type MagneticProps = {
  children: ReactElement;
  strength?: number;
};

export default function Magnetic({ children, strength = 16 }: MagneticProps) {
  const holder = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const wrap = holder.current;
      const target = wrap?.firstElementChild as HTMLElement | null;
      if (!wrap || !target) return;
      if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;

      const xTo = gsap.quickTo(target, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(target, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const box = wrap.getBoundingClientRect();
        xTo(((e.clientX - box.left) / box.width - 0.5) * strength * 2);
        yTo(((e.clientY - box.top) / box.height - 0.5) * strength * 2);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);

      return () => {
        wrap.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: holder, dependencies: [strength] }
  );

  return (
    <span ref={holder} style={{ display: "inline-flex" }}>
      {children}
    </span>
  );
}
