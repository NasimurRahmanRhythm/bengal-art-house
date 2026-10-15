export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Every whole-percent step, so a crossing is noticed however tall `el` is. */
const STEPS = Array.from({ length: 101 }, (_, i) => i / 100);

/**
 * Observes `el` and calls `onEnter` once it scrolls into view, then stops
 * observing. Falls back to firing immediately when reduced motion is on.
 *
 * "In view" means `threshold` of the element is on screen — or, for an
 * element taller than the screen, that it fills `threshold` of the screen.
 * The second half matters: a ratio of the element alone can never be met by
 * a long grid (28 artist cards stack to 12,000px on a phone, so at most 7% of
 * it is ever visible), and the grid stayed invisible for good.
 */
export function revealOnce(
  el: Element,
  onEnter: () => void,
  options: { threshold?: number; rootMargin?: string } = {}
): () => void {
  if (prefersReducedMotion()) {
    onEnter();
    return () => {};
  }

  const threshold = options.threshold ?? 0.15;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const visible =
          entry.intersectionRatio >= threshold ||
          entry.intersectionRect.height >= window.innerHeight * threshold;
        if (visible) {
          onEnter();
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: STEPS, rootMargin: options.rootMargin }
  );

  observer.observe(el);
  return () => observer.disconnect();
}

/**
 * Reveals the items of a list one by one, each as it scrolls into view —
 * for lists that grow with the gallery's content (artists, posts, members,
 * exhibitions). Items arriving together are staggered by `step` seconds in
 * reading order, capped so nothing waits more than a moment; an item further
 * down is never held back by its position in the list.
 */
export function revealEach(
  items: HTMLElement[],
  onEnter: (item: HTMLElement) => void,
  step = 0.08
): () => void {
  if (prefersReducedMotion()) {
    items.forEach(onEnter);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target as HTMLElement)
        .sort((a, b) => items.indexOf(a) - items.indexOf(b))
        .forEach((item, k) => {
          item.style.setProperty("--item-delay", `${Math.min(k, 5) * step}s`);
          onEnter(item);
          observer.unobserve(item);
        });
    },
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
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
