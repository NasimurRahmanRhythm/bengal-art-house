import Link from "next/link";
import ArtPlate from "@/components/ArtPlate/ArtPlate";
import Reveal from "@/components/motion/Reveal";
import { ArrowIcon } from "@/components/Icons";
import styles from "./FoundingLegacy.module.css";

export default function FoundingLegacy() {
  return (
    <Reveal as="div" variant="fromLeft" className={styles.card}>
      <Link href="/artists/hamiduzzaman-khan" className={styles.link} data-cursor="link">
        <span className={styles.plate}>
          <ArtPlate variant={0} />
        </span>
        <span className={styles.body}>
          <span className={styles.eyebrow}>Founding Artist, 1946–2025</span>
          <span className={styles.name}>Hamiduzzaman Khan</span>
          <span className={styles.text}>
            The gallery began as a home for his sculpture, drawings and public works — the
            practice Bengal Art House now carries forward with a growing circle of artists.
          </span>
          <span className={styles.cta}>
            Read his story <ArrowIcon size={14} />
          </span>
        </span>
      </Link>
    </Reveal>
  );
}
