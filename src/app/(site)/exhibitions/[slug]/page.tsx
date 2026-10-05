import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHero from "@/components/sections/PageHero";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import ParkBanner from "@/components/sections/ParkBanner";
import { getExhibitions } from "@/lib/site-data";
import styles from "@/components/Exhibitions/Exhibitions.module.css";

type Params = Promise<{ slug: string }>;

const STATUS_LABEL = {
  current: "On view",
  upcoming: "Upcoming",
  past: "Archive",
} as const;

export async function generateStaticParams() {
  return (await getExhibitions()).map((e) => ({ slug: e.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = (await getExhibitions()).find((e) => e.id === slug);
  if (!exhibition) return {};
  return {
    title: exhibition.title,
    description: exhibition.blurb,
  };
}

export default async function ExhibitionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const exhibition = (await getExhibitions()).find((e) => e.id === slug);
  if (!exhibition) notFound();

  const photos = exhibition.photos ?? (exhibition.photo ? [exhibition.photo] : []);
  const [cover, ...rest] = photos;

  const facts = [
    { label: "When", value: exhibition.date || exhibition.year },
    { label: "Where", value: exhibition.venue },
    { label: "Entry", value: exhibition.entry ?? "" },
    { label: "Opening hours", value: exhibition.hours ?? "" },
  ].filter((f) => f.value);

  return (
    <>
      <PageHero
        kicker={STATUS_LABEL[exhibition.status]}
        title={exhibition.title}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Exhibitions", href: "/exhibitions" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className={styles.detail}>
            <div>
              <span className={styles.detailCover}>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={exhibition.title} className={styles.detailPhoto} />
                ) : (
                  <ArtPlate variant={exhibition.plate} />
                )}
              </span>
              {exhibition.blurb && <p className={styles.detailBlurb}>{exhibition.blurb}</p>}
            </div>

            <div className={styles.detailFacts}>
              {facts.map((f) => (
                <div key={f.label} className={styles.detailFact}>
                  <span className={styles.detailLabel}>{f.label}</span>
                  <span className={styles.detailValue}>{f.value}</span>
                </div>
              ))}
            </div>
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
