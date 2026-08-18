import type { Metadata } from "next";
import Link from "next/link";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import FoundingLegacy from "@/components/sections/FoundingLegacy";
import WorksGrid from "@/components/sections/WorksGrid";
import ParkBanner from "@/components/sections/ParkBanner";
import Marquee from "@/components/Marquee/Marquee";
import ChiselRule from "@/components/motion/ChiselRule";
import Reveal from "@/components/motion/Reveal";
import { MATERIALS } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Gallery Hamiduzzaman represents a growing circle of Bangladeshi artists, carrying forward the modern sculpture tradition founded by Hamiduzzaman Khan.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About"
        title={
          <>
            A house for Bangladeshi
            <br />
            sculpture, drawing <span className="em">&amp; public art.</span>
          </>
        }
        lede="Gallery Hamiduzzaman represents a growing circle of Bangladeshi artists, carrying forward a tradition of modern sculpture into the country's parks, campuses and public memory."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[
          { label: "Artists", value: "3" },
          { label: "Public works", value: "40+" },
          { label: "Founded", value: "2026" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="Who We Are"
            title={
              <>
                Representing artists,
                <br />
                <span className="em">curating exhibitions.</span>
              </>
            }
            body="Gallery Hamiduzzaman began as a home for the sculpture, drawings and public works of Hamiduzzaman Khan — one of the founding figures of modern sculpture in Bangladesh. Today it represents a small, growing circle of sculptors and artists working across bronze, stone, steel and paper."
            aside={
              <Reveal delay={0.25}>
                <p style={{ fontSize: "15px", color: "var(--text-muted)", marginTop: "18px" }}>
                  The gallery curates exhibitions, stewards an open-air sculpture park, and offers
                  advisory, cataloguing, conservation and authentication services to collectors and
                  institutions — see <Link href="/services">Services</Link>.
                </p>
              </Reveal>
            }
          />
        </div>
      </section>

      <ChiselRule />

      <Marquee items={MATERIALS} />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="Where It Started"
            title={
              <>
                A studio, and
                <br />
                <span className="em">its legacy.</span>
              </>
            }
            body="Before it was a gallery, it was one artist's studio. His practice is still the clearest expression of what the gallery stands for."
          />
          <FoundingLegacy />
        </div>
      </section>

      <ChiselRule />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="Notable Works"
            title={
              <>
                Public sculpture, held in
                <br />
                <span className="em">stone and steel.</span>
              </>
            }
            body="A selection of the monumental works installed across Bangladesh and abroad, spanning bronze, granite, mild steel and marble."
          />
        </div>
        <div className="wrap">
          <WorksGrid />
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
