import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import MediumGrid from "@/components/sections/MediumGrid";
import ArtworkGrid from "@/components/Artworks/ArtworkGrid";
import ChiselRule from "@/components/motion/ChiselRule";
import Reveal from "@/components/motion/Reveal";
import { ARTWORKS } from "@/data/artworks";
import sections from "@/components/sections/Sections.module.css";

export const metadata: Metadata = {
  title: "Artworks",
  description:
    "Studio sculptures, editions, drawings and watercolours available for acquisition from Bengal Art House.",
};

const available = ARTWORKS.filter((a) => a.status === "available").length;

export default function ArtworksPage() {
  return (
    <>
      <PageHero
        kicker="Explore Art"
        title={
          <>
            Bronze, stone, steel <span className="em">&amp; paper.</span>
          </>
        }
        lede="Sculpture is only one medium across the gallery's roster — the studio works across bronze, stone, steel and paper, and a portion of the archive is available to collectors."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[
          { label: "Works listed", value: String(ARTWORKS.length) },
          { label: "Available", value: String(available) },
          { label: "Artists", value: "3" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="Browse by Medium"
            title={
              <>
                Four materials,
                <br />
                <span className="em">one vocabulary.</span>
              </>
            }
            body="Each material carried a different part of the work — the cast for editions, the carved for weight, the welded for the public monuments, and paper for everything still being worked out."
          />
          <MediumGrid />
        </div>
      </section>

      <ChiselRule />

      <section className={`section ${sections.shopSection}`}>
        <div className="wrap">
          <SectionHead
            kicker="Available Now"
            title={
              <>
                Works available
                <br />
                for <span className="em">acquisition.</span>
              </>
            }
            body="Studio sculptures, editions, drawings and watercolours available for purchase, separate from the permanent public installations."
          />

          <ArtworkGrid showFilters />

          <Reveal delay={0.1}>
            <p className={sections.shopNote}>
              Prices and availability are indicative and subject to confirmation. All acquisitions
              are supported by the gallery&apos;s provenance and authentication service — see{" "}
              <Link href="/services">Services</Link>.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
