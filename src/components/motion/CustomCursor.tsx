"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import styles from "./CustomCursor.module.css";

// Anything the browser already shows a pointer cursor for. The dot grows over
// these, so the two cues — the native pointer and the dot — agree with each
// other rather than the dot doing its own separate thing.
const HOVER_SELECTOR =
  "a, button, input, textarea, select, label, summary, [role='button'], [data-cursor]";

/**
 * A small theme-coloured dot that trails the real cursor. The system cursor
 * is never hidden or replaced — arrow, text caret and pointer all behave
 * exactly as the browser already renders them; this only adds a companion
 * dot on top, and only on devices that actually have a mouse.
 *
 * Two nested elements rather than one: the outer node's transform is owned
 * entirely by GSAP (position, via quickTo), the inner node's transform is
 * owned entirely by a CSS class toggle (the hover scale). Driving both x/y
 * and scale through GSAP on the same element hits a real GSAP quirk — a
 * second quickTo on a transform sub-property can lose its place in the
 * tween's property cache and silently stop applying — so the two concerns
 * are kept on separate elements instead of fighting over one transform.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    if (!enabled || !dot) return;

    // quickTo rather than gsap.to on every move: it reuses one tween and just
    // retargets it, which is the cheap way to drive something on every
    // pointermove.
    const moveX = gsap.quickTo(dot, "x", { duration: 0.45, ease: "power3.out" });
    const moveY = gsap.quickTo(dot, "y", { duration: 0.45, ease: "power3.out" });

    let shown = false;

    const onMove = (e: PointerEvent) => {
      moveX(e.clientX);
      moveY(e.clientY);
      if (!shown) {
        shown = true;
        dot.classList.add(styles.visible);
      }
    };

    const onOver = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.(HOVER_SELECTOR)) {
        dot.classList.add(styles.hover);
      }
    };
    const onOut = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.(HOVER_SELECTOR)) {
        dot.classList.remove(styles.hover);
      }
    };
    // Hide rather than leave it stranded when the pointer leaves the page —
    // the document root, not window, is what actually fires this reliably.
    const onLeave = () => {
      shown = false;
      dot.classList.remove(styles.visible);
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={dotRef} id="cursor-dot" className={styles.dot} aria-hidden="true">
      <span className={styles.dotInner} />
    </div>
  );
}
