import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHero from "@/components/sections/PageHero";
import PostBody from "@/components/sections/PostBody";
import ChiselRule from "@/components/motion/ChiselRule";
import ParkBanner from "@/components/sections/ParkBanner";
import { getPosts } from "@/lib/site-data";
import { formatLongDate } from "@/lib/content";
import styles from "@/components/sections/PostBody.module.css";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPosts()).find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = (await getPosts()).find((p) => p.slug === slug);
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
          {post.videoUrl && (
            <div className={styles.video}>
              <video src={post.videoUrl} controls preload="metadata" playsInline />
            </div>
          )}
          <PostBody html={post.html} />
        </div>
      </section>

      <ChiselRule />

      <ParkBanner />
    </>
  );
}
