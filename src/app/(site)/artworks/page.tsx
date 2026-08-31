import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/sections/PageHero";
import ArtworkGrid from "@/components/Artworks/ArtworkGrid";
import Reveal from "@/components/motion/Reveal";
import { getArtworks } from "@/lib/site-data";
import sections from "@/components/sections/Sections.module.css";

export const metadata: Metadata = {
  title: "Artworks",
  description: "Works available for acquisition from Gallery Hamiduzzaman.",
};

// A title and one line, then the works. Everything else that used to sit above
// the grid — the four-materials essay, the second heading — was writing a
// visitor had to scroll past to reach what they came for.
export default async function ArtworksPage() {
  const artworks = await getArtworks();
  const available = artworks.filter((a) => a.status === "available").length;

  return (
    <>
      <PageHero
        kicker="Explore Art"
        title={
          <>
            Works for <span className="em">acquisition.</span>
          </>
        }
        lede="Sculpture, painting, calligraphy and installation from the studio archive."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[
          { label: "Works listed", value: String(artworks.length) },
          { label: "Available", value: String(available) },
        ]}
      />

      <section className={`section ${sections.shopSection}`}>
        <div className="wrap">
          <ArtworkGrid artworks={artworks} showFilters />

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
