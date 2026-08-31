import type { Metadata } from "next";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import ArtistGrid from "@/components/sections/ArtistGrid";
import ParkBanner from "@/components/sections/ParkBanner";
import ChiselRule from "@/components/motion/ChiselRule";
import { getArtists } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "The studio and its circle — Hamiduzzaman Khan, Ivy Zaman, and the family carrying the archive forward.",
};

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <>
      <PageHero
        kicker="Explore Art"
        title={
          <>
            The studio and <span className="em">its circle.</span>
          </>
        }
        lede="The artists behind the work — founder, family, and the studio carrying the archive forward."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[
          { label: "Artists", value: String(artists.length) },
          { label: "Generations", value: "2" },
          { label: "Based in", value: "Dhaka" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="The Circle"
            title={
              <>
                One practice,
                <br />
                carried <span className="em">by three.</span>
              </>
            }
            body="What began in a Dhaka studio in the 1970s is now held by the people who worked closest to it — as sculptors in their own right, and as its archivists."
          />
          <ArtistGrid artists={artists} />
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
