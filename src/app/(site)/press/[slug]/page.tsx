import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHero from "@/components/sections/PageHero";
import PostBody from "@/components/sections/PostBody";
import ChiselRule from "@/components/motion/ChiselRule";
import ParkBanner from "@/components/sections/ParkBanner";
import { SEED } from "@/lib/admin/seed";
import { formatLongDate } from "@/lib/content";

type Params = Promise<{ slug: string }>;

const published = () => SEED.pressReleases.filter((p) => p.published && p.publishedAt);

export function generateStaticParams() {
  return published().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = published().find((p) => p.slug === slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.excerpt,
  };
}

export default async function PressItemPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = published().find((p) => p.slug === slug);
  if (!item) notFound();

  return (
    <>
      <PageHero
        kicker="Media & Press"
        title={item.title}
        lede={item.excerpt}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Media & Press", href: "/press" },
        ]}
        meta={[
          { label: "Published", value: formatLongDate(item.publishedAt as string) },
          ...(item.authorName ? [{ label: "By", value: item.authorName }] : []),
        ]}
      />

      <section className="section">
        <div className="wrap">
          <PostBody html={item.html} />
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
