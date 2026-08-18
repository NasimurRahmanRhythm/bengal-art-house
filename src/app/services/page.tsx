import type { Metadata } from "next";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import ServiceGrid from "@/components/sections/ServiceGrid";
import ChiselRule from "@/components/motion/ChiselRule";
import ParkBanner from "@/components/sections/ParkBanner";
import sections from "@/components/sections/Sections.module.css";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Advisory, cataloguing, conservation, provenance, public art consultation and valuation for collectors and institutions.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Services"
        title={
          <>
            Let us <span className="em">help.</span>
          </>
        }
        lede="Support for collectors, institutions and public-space planners engaging with the gallery's artists and their work — from a single drawing to a campus commission."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[
          { label: "Services", value: "6" },
          { label: "Response", value: "2 days" },
          { label: "Coverage", value: "Nationwide" },
        ]}
      />

      <section className={`section ${sections.dark} onDark`}>
        <div className="wrap">
          <SectionHead
            kicker="What We Do"
            title={
              <>
                Six ways into
                <br />
                <span className="em">the work.</span>
              </>
            }
            body="Each service is run by the gallery directly, drawing on the studio archive and on conservators who have worked with these materials in the open air."
          />
          <ServiceGrid />
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
