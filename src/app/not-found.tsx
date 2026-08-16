import Link from "next/link";
import SplitHeading from "@/components/motion/SplitHeading";
import Reveal from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/Icons";
import styles from "./page.module.css";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap" style={{ paddingTop: "6vh", paddingBottom: "6vh" }}>
        <span className="kicker">404</span>
        <SplitHeading as="h1" style={{ fontSize: "clamp(34px, 6vw, 72px)", maxWidth: "14ch" }}>
          This piece is not on the wall.
        </SplitHeading>
        <Reveal delay={0.15}>
          <p style={{ maxWidth: "46ch", color: "var(--text-muted)", marginTop: "20px" }}>
            The page you were looking for has been moved or never hung here. The collection is still
            where you left it.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <Link href="/" className={styles.textLink}>
            Back to the gallery <ArrowIcon size={14} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
