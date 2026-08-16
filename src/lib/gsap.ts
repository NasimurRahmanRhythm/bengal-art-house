"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

  // A single house style for every tween in the site.
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** True when the visitor has asked the OS to keep motion to a minimum. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * SplitText needs final metrics to slice lines correctly, so hold every
 * text animation until the webfonts have actually landed.
 */
export function whenFontsReady(run: () => void): () => void {
  let cancelled = false;
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;

  if (fonts?.ready) {
    fonts.ready.then(() => {
      if (!cancelled) run();
    });
  } else {
    run();
  }

  return () => {
    cancelled = true;
  };
}

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText };
