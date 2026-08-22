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
  window.setTimeout(finishIntro, 2600);
}
