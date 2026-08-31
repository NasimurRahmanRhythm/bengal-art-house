import Link from "next/link";

import Hero from "@/components/Hero/Hero";
import Marquee from "@/components/Marquee/Marquee";
import ChiselRule from "@/components/motion/ChiselRule";
import Reveal from "@/components/motion/Reveal";
import AboutSculptor from "@/components/sections/AboutSculptor";
import ArtistGrid from "@/components/sections/ArtistGrid";
import QuickLinks from "@/components/sections/QuickLinks";
import ParkBanner from "@/components/sections/ParkBanner";
import SectionHead from "@/components/sections/SectionHead";
import ExhibitionCarousel from "@/components/Exhibitions/ExhibitionCarousel";
import ArtworkGrid from "@/components/Artworks/ArtworkGrid";
import { ArrowIcon } from "@/components/Icons";
import { MATERIALS } from "@/data/site";
import { getArtists, getArtworks, getExhibitions } from "@/lib/site-data";
import styles from "./page.module.css";

export default async function Home() {
  const [artworks, artists, exhibitions] = await Promise.all([
    getArtworks(),
    getArtists(),
    getExhibitions(),
  ]);

  return (
    <>
      <Hero exhibitions={exhibitions} />

      <Marquee items={MATERIALS} />

      <AboutSculptor />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="The Circle"
            title={
              <>
                Meet the <span className="em">artists.</span>
              </>
            }
            body="Hamiduzzaman Khan's studio has grown into a small circle of sculptors and archivists, each carrying part of the practice forward."
            aside={
              <Reveal delay={0.25}>
                <Link href="/artists" className={styles.textLink}>
                  All artists <ArrowIcon size={14} />
                </Link>
              </Reveal>
            }
          />
          <ArtistGrid artists={artists} />
        </div>
      </section>

      <ChiselRule />

      <QuickLinks />

      <ChiselRule />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="On View"
            title={
              <>
                Five decades,
                <br />
                <span className="em">still on the wall.</span>
              </>
            }
            body="Solo and retrospective exhibitions tracing sculpture, watercolour, drawing and print across his career — with two shows open this season."
            aside={
              <Reveal delay={0.25}>
                <Link href="/exhibitions" className={styles.textLink}>
                  All exhibitions <ArrowIcon size={14} />
                </Link>
              </Reveal>
            }
          />
        </div>
        <div className="wrap">
          <ExhibitionCarousel exhibitions={exhibitions} />
        </div>
      </section>

      <ChiselRule />

      <section className={`section ${styles.shop}`}>
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
            aside={
              <Reveal delay={0.25}>
                <Link href="/artworks" className={styles.textLink}>
                  Browse everything <ArrowIcon size={14} />
                </Link>
              </Reveal>
            }
          />
          <ArtworkGrid artworks={artworks} limit={6} />
        </div>
      </section>

      <ParkBanner />
    </>
  );
}
