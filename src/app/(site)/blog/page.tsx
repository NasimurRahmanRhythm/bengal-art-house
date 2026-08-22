import type { Metadata } from "next";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import PostGrid from "@/components/sections/PostGrid";
import ParkBanner from "@/components/sections/ParkBanner";
import ChiselRule from "@/components/motion/ChiselRule";
import { SEED } from "@/lib/admin/seed";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from the studio — process, exhibitions and new work, written by Gallery Hamiduzzaman.",
};

export default function BlogIndexPage() {
  // published implies publishedAt is set — the admin form stamps both
  // together, so the cast below just names that invariant.
  const posts = [...SEED.posts]
    .filter((p) => p.published)
    .sort((a, b) => (b.publishedAt as string).localeCompare(a.publishedAt as string))
    .map((p) => ({ ...p, publishedAt: p.publishedAt as string }));

  return (
    <>
      <PageHero
        kicker="Blog"
        title={
          <>
            Notes from <span className="em">the studio.</span>
          </>
        }
        lede="Process notes, exhibition writing and dispatches from the foundry — the thinking behind the work, written by the gallery."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[{ label: "Posts", value: String(posts.length) }]}
      />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="Latest"
            title={
              <>
                Writing from
                <br />
                <span className="em">the gallery.</span>
              </>
            }
          />

          {posts.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              Nothing published yet — the first post will appear here.
            </p>
          ) : (
            <PostGrid basePath="/blog" items={posts} />
          )}
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
