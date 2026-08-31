import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import ArtistProfile from "@/components/sections/ArtistProfile";
import ChiselRule from "@/components/motion/ChiselRule";
import ParkBanner from "@/components/sections/ParkBanner";
import ArtworkGrid from "@/components/Artworks/ArtworkGrid";
import { getArtists, getArtworks } from "@/lib/site-data";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getArtists()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const artist = (await getArtists()).find((a) => a.slug === slug);
  if (!artist) return {};
  return {
    title: artist.name,
    description: artist.body,
  };
}

export default async function ArtistPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [artists, artworks] = await Promise.all([getArtists(), getArtworks()]);
  const artist = artists.find((a) => a.slug === slug);
  if (!artist) notFound();

  return (
    <>
      {/* No lede: the gallery fills in a name, a picture and a biography, so
          the only text available here is the biography's opening paragraph —
          which then reads again, in full, a few centimetres below. */}
      <PageHero
        kicker="Artist"
        title={artist.name}
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
          <ArtworkGrid artworks={artworks} artist={artist.name} />
        </div>
      </section>

      <ParkBanner />
    </>
  );
}
