export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Observes `el` and calls `onEnter` once it scrolls into view, then stops
 * observing. Falls back to firing immediately when reduced motion is on.
 */
export function revealOnce(
  el: Element,
  onEnter: () => void,
  options: IntersectionObserverInit = { threshold: 0.15 }
): () => void {
  if (prefersReducedMotion()) {
    onEnter();
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        onEnter();
        observer.unobserve(entry.target);
      }
    }
  }, options);

  observer.observe(el);
  return () => observer.disconnect();
}

/** Per-item delay (seconds) for a grid stagger, optionally weighted by distance from center. */
export function gridStaggerDelay(
  index: number,
  cols: number,
  rows: number,
  each: number,
  from: "start" | "center" = "start"
): number {
  if (from === "start") return index * each;

  const col = index % cols;
  const row = Math.floor(index / cols);
  const centerCol = (cols - 1) / 2;
  const centerRow = (rows - 1) / 2;
  return Math.hypot(col - centerCol, row - centerRow) * each;
}
