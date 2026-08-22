import styles from "./PostBody.module.css";

/** Renders the sanitized HTML written in the admin's rich text editor, in the
    site's own serif measure. The markup is already cleaned by sanitizeHtml
    at save time in the admin — this only ever renders the gallery's own
    authored content, never anything a visitor submitted. */
export default function PostBody({ html }: { html: string }) {
  return <div className={styles.body} dangerouslySetInnerHTML={{ __html: html }} />;
}
