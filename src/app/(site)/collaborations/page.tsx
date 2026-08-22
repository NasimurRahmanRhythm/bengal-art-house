import type { Metadata } from "next";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import CollabList from "@/components/sections/CollabList";
import Marquee from "@/components/Marquee/Marquee";
import ChiselRule from "@/components/motion/ChiselRule";
import ParkBanner from "@/components/sections/ParkBanner";

const PLACES = ["Baroda", "Seoul", "Dhaka", "New York", "London", "Cairo", "Kishoreganj"];

export const metadata: Metadata = {
  title: "Collaborations",
  description:
    "Study, exchange and installation across borders — Baroda, Seoul Olympic Park, Europe, the United States and North Africa.",
};

export default function CollaborationsPage() {
  return (
    <>
      <PageHero
        kicker="Collaborations"
        title={
          <>
            Beyond one studio, <span className="em">one country.</span>
          </>
        }
        lede="Study, exchange and installation across borders — the encounters that shaped his abstract vocabulary and carried the work outside Bangladesh."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[
          { label: "Countries", value: "4" },
          { label: "Permanent abroad", value: "1988" },
          { label: "Years of exchange", value: "20+" },
        ]}
      />

      <Marquee items={PLACES} speed={30} />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="Places"
            title={
              <>
                Where the language
                <br />
                <span className="em">was learned.</span>
              </>
            }
            body="Each of these journeys left something in the work — a way of siting a form, of finishing a surface, of letting a monument hold a public square."
          />
          <CollabList />
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
