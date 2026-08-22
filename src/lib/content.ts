// Shared by the public blog and press pages. Long-form date, matching how
// exhibition dates read on the site ("14 August 2026") rather than the
// admin's shorter "14 Aug 2026".
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
