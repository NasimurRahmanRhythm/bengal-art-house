import type { Metadata } from "next";
import Image from "next/image";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import ContactBlock from "@/components/sections/ContactBlock";
import ChiselRule from "@/components/motion/ChiselRule";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/Icons";
import { SITE } from "@/data/site";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit Gallery Hamiduzzaman in Gulshan, Dhaka, or arrange a private viewing of the collection.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        title={
          <>
            Visit the gallery, or arrange a <span className="em">private viewing.</span>
          </>
        }
        lede="Gallery Hamiduzzaman hosts exhibitions and private cultural events, with proceeds supporting continued documentation of Bangladesh's public sculpture."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[
          { label: "District", value: "Gulshan" },
          { label: "Open", value: "Tue–Sat" },
          { label: "Hours", value: "11–19" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <SectionHead
            kicker="Enquiries"
            title={
              <>
                Tell us what
                <br />
                you&apos;re <span className="em">looking for.</span>
              </>
            }
            body="Acquisitions, conservation, research access or a commission — send a note and the gallery will come back to you within two working days."
          />
          <ContactBlock />
        </div>
      </section>

      <ChiselRule />

      <section className="section" id="visit">
        <div className="wrap">
          <SectionHead
            kicker="Find Us"
            title={
              <>
                In the heart of
                <br />
                <span className="em">Gulshan.</span>
              </>
            }
            body="Open Tuesday to Saturday, 11:00 – 19:00. Private viewings outside these hours are arranged by appointment."
          />
          <Reveal variant="wipe">
            <figure className={styles.mapFigure}>
              <iframe
                src={SITE.mapEmbedUrl}
                title={`Map showing ${SITE.name}, ${SITE.address}`}
                className={styles.map}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <figcaption className={styles.mapCaption}>
                <span>{SITE.address}</span>
                <a
                  href={SITE.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapLink}
                  data-cursor="link"
                >
                  Get directions <ArrowIcon size={13} />
                </a>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <ChiselRule />

      <section className="section">
        <div className="wrap">
          <Reveal variant="wipe">
            <figure className={styles.roomFigure}>
              <Parallax amount={-60}>
                <Image
                  src="/gallery-hero.png"
                  alt="Visitors in the gallery's main hall, works hung along a lit wall"
                  width={1400}
                  height={1400}
                  sizes="100vw"
                  className={styles.roomImg}
                />
              </Parallax>
              <figcaption className={styles.roomCaption}>
                <span>The main hall, Gulshan</span>
                <span>Open Tuesday to Saturday</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
    </>
  );
}
