"use client";

import { useEffect, useRef } from "react";
import { revealOnce } from "@/lib/motion";
import PostCard from "./PostCard";
import styles from "./PostGrid.module.css";

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  authorName: string;
  publishedAt: string;
};

/** Reveal-on-scroll card grid shared by /blog and /press — same layout,
    different base path and content. */
export default function PostGrid({
  items,
  basePath,
}: {
  items: PostSummary[];
  basePath: "/blog" | "/press";
}) {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;

    Array.from(el.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty("--item-delay", `${i * 0.1}s`);
    });

    return revealOnce(el, () => {
      Array.from(el.children).forEach((child) => child.classList.add(styles.inView));
    });
  }, [items]);

  return (
    <div ref={grid} className={`${styles.grid} ${styles.reveal}`}>
      {items.map((item, i) => (
        <PostCard
          key={item.slug}
          href={`${basePath}/${item.slug}`}
          title={item.title}
          excerpt={item.excerpt}
          coverUrl={item.coverUrl}
          authorName={item.authorName}
          publishedAt={item.publishedAt}
          plateVariant={i}
        />
      ))}
    </div>
  );
}
