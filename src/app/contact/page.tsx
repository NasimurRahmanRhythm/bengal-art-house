import type { Metadata } from "next";
import Image from "next/image";

import PageHero from "@/components/sections/PageHero";
import SectionHead from "@/components/sections/SectionHead";
import ContactBlock from "@/components/sections/ContactBlock";
import ChiselRule from "@/components/motion/ChiselRule";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit Bengal Art House in Dhanmondi, Dhaka, or arrange a private viewing of the collection.",
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
        lede="Bengal Art House hosts exhibitions and private cultural events, with proceeds supporting continued documentation of Bangladesh's public sculpture."
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[
          { label: "District", value: "Dhanmondi" },
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
                <span>The main hall, Dhanmondi</span>
                <span>Open Tuesday to Saturday</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
    </>
  );
}
