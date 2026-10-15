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

// The shape a published blog post or press item renders from — deliberately
// independent of the admin dashboard's types. The public site and the admin
// panel deploy separately, so a page under (site) can never import from
// src/lib/admin/*: that directory is excluded from the public build, and
// doing so breaks compilation the moment it isn't checked out.
export type ContentItem = {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  html: string;
  authorName: string;
  publishedAt: string;
  /** Blog only: an optional video shown above the post. */
  videoUrl?: string | null;
};
