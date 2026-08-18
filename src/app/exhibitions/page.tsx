import type { Metadata } from "next";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import ExhibitionCarousel from "@/components/Exhibitions/ExhibitionCarousel";
import ExhibitionTimeline from "@/components/Exhibitions/ExhibitionTimeline";
import ChiselRule from "@/components/motion/ChiselRule";
import ParkBanner from "@/components/sections/ParkBanner";
import { EXHIBITIONS } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Exhibitions",
  description:
    "Solo and retrospective exhibitions tracing sculpture, watercolour, drawing and print across five decades.",
};

export default function ExhibitionsPage() {
  const live = EXHIBITIONS.filter((e) => e.status !== "past").length;

  return (
    <>
      <PageHero
        kicker="Exhibitions"
        title={
          <>
            Five decades <span className="em">on view.</span>
          </>
        }
        lede="Solo and retrospective exhibitions tracing sculpture, watercolour, drawing and print across his career, from the first National Sculpture Exhibition to the 2025 retrospective."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[
          { label: "This season", value: String(live) },
          { label: "In the archive", value: String(EXHIBITIONS.length) },
          { label: "Since", value: "1976" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="This Season"
            title={
              <>
                Open now and
                <br />
                <span className="em">opening soon.</span>
              </>
            }
            body="Two shows are live this season — drag the rail or use the arrows to move through them."
          />
        </div>
        <div className="wrap">
          <ExhibitionCarousel />
        </div>
      </section>

      <ChiselRule />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="The Record"
            title={
              <>
                Every show,
                <br />
                <span className="em">in order.</span>
              </>
            }
            body="The full exhibition history held by the gallery, from group shows and awards through to the museum retrospectives."
          />
          <ExhibitionTimeline />
        </div>
      </section>

      <ParkBanner />
    </>
  );
}
