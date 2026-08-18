"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";

export { prefersReducedMotion } from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

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
