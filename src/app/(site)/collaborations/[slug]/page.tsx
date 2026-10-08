import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHero from "@/components/sections/PageHero";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import ParkBanner from "@/components/sections/ParkBanner";
import { getCollaborations } from "@/lib/site-data";
import styles from "@/components/Exhibitions/Exhibitions.module.css";

type Params = Promise<{ slug: string }>;

// Laid out like an exhibition page — the cover, the write-up, the facts beside
// it, the remaining pictures underneath — so the two read as one family.

export async function generateStaticParams() {
  return (await getCollaborations()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCollaborations()).find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.subtitle || c.body.slice(0, 160),
  };
}

export default async function CollaborationPage({ params }: { params: Params }) {
  const { slug } = await params;
  const c = (await getCollaborations()).find((x) => x.slug === slug);
  if (!c) notFound();

  const [cover, ...rest] = c.photos;
  const paragraphs = c.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const facts = [
    { label: "Artists", value: c.artists },
    { label: "When", value: c.date },
    { label: "Where", value: c.place },
  ].filter((f) => f.value);

  return (
    <>
      <PageHero
        kicker="Collaboration"
        title={c.title}
        lede={c.subtitle || undefined}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Collaborations", href: "/collaborations" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className={styles.detail}>
            <div>
              <span className={styles.detailCover}>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={c.title} className={styles.detailPhoto} />
                ) : (
                  <ArtPlate variant={0} />
                )}
              </span>
              {paragraphs.map((p, i) => (
                <p key={i} className={styles.detailBlurb}>
                  {p}
                </p>
              ))}
            </div>

            {facts.length > 0 && (
              <div className={styles.detailFacts}>
                {facts.map((f) => (
                  <div key={f.label} className={styles.detailFact}>
                    <span className={styles.detailLabel}>{f.label}</span>
                    <span className={styles.detailValue}>{f.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {rest.length > 0 && (
            <div className={styles.detailGallery}>
              {rest.map((src) => (
                <span key={src} className={styles.detailCover}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className={styles.detailPhoto} loading="lazy" />
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <ParkBanner />
    </>
  );
}
