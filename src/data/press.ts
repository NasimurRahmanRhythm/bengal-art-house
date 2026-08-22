import type { ContentItem } from "@/lib/content";

// Press coverage and media mentions. Canonical copy, same reasoning as
// src/data/posts.ts — the admin dashboard's seed data maps over this array
// rather than duplicating it.
export const PRESS_RELEASES: ContentItem[] = [
  {
    slug: "gallery-hamiduzzaman-featured-daily-star",
    title: "Gallery Hamiduzzaman's retrospective featured in The Daily Star",
    excerpt:
      "The August retrospective drew coverage for its scale — five decades of work gathered in one room for the first time.",
    coverUrl: null,
    html: [
      "<p>The Daily Star's arts desk covered the opening of <em>Hamiduzzaman Khan: A Retrospective</em>, calling it \"the most complete public account yet of a sculptor who shaped how Dhaka thinks about public space.\"</p>",
      "<p>The piece traces the show from the early maquettes through the bronze birds to the granite forms of the last decade, and includes an interview conducted at the gallery during installation week.</p>",
      "<blockquote>Few retrospectives manage to make fifty years feel like one continuous sentence. This one does.</blockquote>",
      "<p>The full article is available on the Daily Star's arts and culture pages.</p>",
    ].join(""),
    authorName: "Gallery Hamiduzzaman",
    publishedAt: "2026-08-16T08:30:00.000Z",
  },
];
