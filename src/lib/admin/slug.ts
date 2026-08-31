// Slugs, initials and sort positions are all derivable from what the admin
// already typed. Asking for them by hand would be three extra fields per
// record for no information gain.

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Keeps a slug unique without making the admin think about it.
export function uniqueSlug(base: string, taken: string[], selfSlug?: string): string {
  const root = slugify(base) || "untitled";
  const others = new Set(taken.filter((s) => s !== selfSlug));
  if (!others.has(root)) return root;
  let n = 2;
  while (others.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

export function nextPlate(existing: number[]): number {
  return existing.length ? Math.max(...existing) + 1 : 0;
}

export function formatBDT(amount: number): string {
  return `BDT ${amount.toLocaleString("en-US")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

// Receipts need the clock as well as the date — "paid at 14:55" is what
// settles a "did it go through?" question.
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
