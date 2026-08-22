import type { ContentItem } from "@/lib/content";

// The gallery's blog. This is the canonical copy — the admin dashboard's seed
// data maps over this same array rather than duplicating it, so the public
// site and the admin preview never drift apart. When the blog moves to
// Supabase, this file is what gets seeded into the `posts` table.
export const POSTS: ContentItem[] = [
  {
    slug: "casting-a-bird-in-bronze",
    title: "Casting a bird in bronze: from wax to patina",
    excerpt:
      "Six weeks, four failures and one wing that finally sat right. A walk through the lost-wax process behind the Bird Study series.",
    coverUrl: null,
    html: [
      "<p>Every bronze in the <em>Bird Study</em> series begins as a lump of microcrystalline wax, warmed until it takes a thumbprint. Nothing about the finished object suggests how soft it started.</p>",
      "<h2>The wax stage</h2>",
      "<p>The model is built up in layers rather than carved down. Working additively means a wing can be lengthened at four in the afternoon and shortened again by six, which is exactly how the second study got its silhouette.</p>",
      "<blockquote>You are not making the sculpture yet. You are making the thing that will be destroyed to make the sculpture.</blockquote>",
      "<h2>Investment and burnout</h2>",
      "<p>The wax is sprued, gated and dipped in a ceramic slurry until the shell is thick enough to survive the pour. Then it goes into the kiln and the wax runs out — the step the process is named for.</p>",
      "<ul><li>Shell coats: seven, drying overnight between each</li><li>Burnout: 12 hours at 730°C</li><li>Pour temperature: roughly 1150°C</li></ul>",
      "<h2>Patina</h2>",
      "<p>Colour is chemistry and heat, applied with a brush while the metal is hot enough to hiss. Ferric nitrate for the browns, cupric nitrate where the light needs to go green in the hollows.</p>",
      "<p>The last step is wax again — a thin coat, buffed cold. The piece ends where it began.</p>",
    ].join(""),
    authorName: "Gallery Hamiduzzaman",
    publishedAt: "2026-08-12T09:00:00.000Z",
  },
];
