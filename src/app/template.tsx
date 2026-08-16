"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export default function Template({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap
        .timeline({ onComplete: () => ScrollTrigger.refresh() })
        .fromTo(
          ".routeSeam",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.5, ease: "power3.inOut" }
        )
        .to(".routeSeam", {
          scaleX: 0,
          transformOrigin: "right center",
          duration: 0.45,
          ease: "power3.inOut",
        })
        .fromTo(
          scope.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", clearProps: "transform" },
          0.15
        );
    },
    { scope }
  );

  return (
    <div ref={scope}>
      <span
        className="routeSeam"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "3px",
          background: "var(--oxide)",
          transform: "scaleX(0)",
          zIndex: 300,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}
