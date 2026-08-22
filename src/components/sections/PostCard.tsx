import Link from "next/link";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import { ArrowIcon } from "@/components/Icons";
import { formatLongDate } from "@/lib/content";
import styles from "./PostCard.module.css";

/** One card in the blog or press listing. Same shape either way — a title,
    an excerpt, who wrote it and when. */
export default function PostCard({
  href,
  title,
  excerpt,
  coverUrl,
  authorName,
  publishedAt,
  plateVariant,
}: {
  href: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  authorName: string;
  publishedAt: string;
  plateVariant: number;
}) {
  return (
    <article className={`${styles.card} plateHost`}>
      <Link href={href} style={{ display: "contents" }} data-cursor="link">
        <span className={styles.thumb}>
          {coverUrl ? (
            // Covers can be a base64 data URL straight from the editor's image
            // upload, which next/image's optimizer does not handle — a plain
            // <img> is what the admin list uses for the same field.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className={styles.thumbImg} />
          ) : (
            <ArtPlate variant={plateVariant} className={styles.thumbPlate} />
          )}
        </span>

        <div className={styles.body}>
          <span className={styles.meta}>
            {formatLongDate(publishedAt)}
            {authorName && ` · ${authorName}`}
          </span>
          <h3 className={styles.title}>{title}</h3>
          {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
          <span className={styles.readMore}>
            Read more <ArrowIcon size={14} />
          </span>
        </div>
      </Link>
    </article>
  );
}
