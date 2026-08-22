import type { Metadata } from "next";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import PostGrid from "@/components/sections/PostGrid";
import ParkBanner from "@/components/sections/ParkBanner";
import ChiselRule from "@/components/motion/ChiselRule";
import { PRESS_RELEASES } from "@/data/press";

export const metadata: Metadata = {
  title: "Media & Press",
  description: "Press coverage and media mentions of Gallery Hamiduzzaman.",
};

export default function PressIndexPage() {
  const items = [...PRESS_RELEASES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <>
      <PageHero
        kicker="Media & Press"
        title={
          <>
            Coverage of <span className="em">the gallery.</span>
          </>
        }
        lede="Press mentions, interviews and coverage of the gallery, its exhibitions and the studio behind them."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[{ label: "Items", value: String(items.length) }]}
      />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="Latest"
            title={
              <>
                In the
                <br />
                <span className="em">press.</span>
              </>
            }
          />

          {items.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              Nothing published yet — the first item will appear here.
            </p>
          ) : (
            <PostGrid basePath="/press" items={items} />
          )}
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
