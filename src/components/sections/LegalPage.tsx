import PageHero from "@/components/sections/PageHero";
import ChiselRule from "@/components/motion/ChiselRule";
import body from "./PostBody.module.css";

// The address the legal documents themselves name. Kept here rather than in
// SITE so it only appears where those documents need it.
export const LEGAL_EMAIL = "info@galleryhamiduzzaman.com";

type LegalPageProps = {
  kicker: string;
  title: React.ReactNode;
  lede: string;
  updated: string;
  children: React.ReactNode;
};

/** Shared frame for the terms, privacy and refund pages: the usual page hero,
    then the text in the blog's serif reading measure. */
export default function LegalPage({ kicker, title, lede, updated, children }: LegalPageProps) {
  return (
    <>
      <PageHero
        kicker={kicker}
        title={title}
        lede={lede}
        crumbs={[{ label: "Home", href: "/" }]}
        meta={[{ label: "Last updated", value: updated }]}
      />

      <section className="section">
        <div className="wrap">
          <div className={body.body}>{children}</div>
        </div>
      </section>

      <ChiselRule />
    </>
  );
}
