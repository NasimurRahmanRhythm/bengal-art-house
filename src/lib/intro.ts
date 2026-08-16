/**
 * Small handshake between the preloader and the hero animation: the hero waits
 * on `introDone` so its type does not play behind the curtain.
 */

let resolve: () => void = () => {};

export const introDone: Promise<void> = new Promise((r) => {
  resolve = r;
});

let settled = false;

export function finishIntro(): void {
  if (settled) return;
  settled = true;
  resolve();
}

if (typeof window !== "undefined") {
  // Safety net — never leave the page waiting on a curtain that failed to lift.
  window.setTimeout(finishIntro, 4000);
}
