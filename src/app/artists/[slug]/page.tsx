import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import ArtistProfile from "@/components/sections/ArtistProfile";
import ChiselRule from "@/components/motion/ChiselRule";
import ParkBanner from "@/components/sections/ParkBanner";
import ArtworkGrid from "@/components/Artworks/ArtworkGrid";
import { ARTISTS } from "@/data/gallery";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return ARTISTS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const artist = ARTISTS.find((a) => a.slug === slug);
  if (!artist) return {};
  return {
    title: artist.name,
    description: artist.body,
  };
}

export default async function ArtistPage({ params }: { params: Params }) {
  const { slug } = await params;
  const artist = ARTISTS.find((a) => a.slug === slug);
  if (!artist) notFound();

  return (
    <>
      <PageHero
        kicker="Artist"
        title={artist.name}
        lede={artist.body}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Artists", href: "/artists" },
        ]}
        meta={artist.facts.slice(0, 3)}
      />

      <section className="section">
        <div className="wrap">
          <ArtistProfile artist={artist} />
        </div>
      </section>

      <ChiselRule />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="In the Gallery"
            title={
              <>
                Works by <span className="em">{artist.name.split(" ")[0]}.</span>
              </>
            }
          />
          <ArtworkGrid artist={artist.name} />
        </div>
      </section>

      <ParkBanner />
    </>
  );
}
