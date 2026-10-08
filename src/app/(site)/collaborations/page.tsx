import type { Metadata } from "next";

import PageHero from "@/components/sections/PageHero";
import CollabList from "@/components/sections/CollabList";
import ChiselRule from "@/components/motion/ChiselRule";
import ParkBanner from "@/components/sections/ParkBanner";
import { getCollaborations } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Collaborations",
  description:
    "Exhibitions, festivals and projects Gallery Hamiduzzaman has taken part in alongside partner institutions and artists.",
};

export default async function CollaborationsPage() {
  const collaborations = await getCollaborations();

  return (
    <>
      <PageHero
        kicker="Collaborations"
        title={
          <>
            Made together, <span className="em">with partners.</span>
          </>
        }
        lede="Exhibitions, festivals and projects the gallery has taken part in alongside partner institutions and artists, at home and abroad."
        crumbs={[{ label: "Home", href: "/" }]}
      />

      <section className="section">
        <div className="wrap">
          <CollabList items={collaborations} />
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
