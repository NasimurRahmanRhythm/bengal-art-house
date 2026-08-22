import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHero from "@/components/sections/PageHero";
import PostBody from "@/components/sections/PostBody";
import ChiselRule from "@/components/motion/ChiselRule";
import ParkBanner from "@/components/sections/ParkBanner";
import { POSTS } from "@/data/posts";
import { formatLongDate } from "@/lib/content";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <PageHero
        kicker="Blog"
        title={post.title}
        lede={post.excerpt}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
        ]}
        meta={[
          { label: "Published", value: formatLongDate(post.publishedAt) },
          ...(post.authorName ? [{ label: "By", value: post.authorName }] : []),
        ]}
      />

      <section className="section">
        <div className="wrap">
          <PostBody html={post.html} />
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
