import type { Metadata } from "next";

import PageHero from "@/components/sections/PageHero";
import MemberGrid from "@/components/sections/MemberGrid";
import ParkBanner from "@/components/sections/ParkBanner";
import ChiselRule from "@/components/motion/ChiselRule";
import { getGoverningBody } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Governing Body",
  description: "The trustees and officers who govern Gallery Hamiduzzaman.",
};

export default async function GoverningBodyPage() {
  const members = await getGoverningBody();

  return (
    <>
      <PageHero
        kicker="The Gallery"
        title={
          <>
            Those who <span className="em">govern it.</span>
          </>
        }
        lede="The trustees and officers responsible for the collection, the programme and the archive."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[{ label: "Members", value: String(members.length) }]}
      />

      <section className="section">
        <div className="wrap">
          {members.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              The governing body will be listed here shortly.
            </p>
          ) : (
            <MemberGrid members={members} />
          )}
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
