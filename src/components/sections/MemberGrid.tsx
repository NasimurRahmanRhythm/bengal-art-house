"use client";

import { useEffect, useRef } from "react";
import { revealEach } from "@/lib/motion";
import type { GoverningMember } from "@/data/gallery";
import styles from "./Sections.module.css";

/** Initials, for a member with no portrait yet. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function MemberGrid({ members }: { members: GoverningMember[] }) {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = grid.current;
    if (!el) return;

    // Card by card, so a larger governing body never outgrows the trigger.
    return revealEach(Array.from(el.children) as HTMLElement[], (card) =>
      card.classList.add(styles.inView),
    );
  }, []);

  return (
    <div ref={grid} className={`${styles.memberGrid} ${styles.gridReveal}`}>
      {members.map((m) => (
        <article key={m.id} className={styles.memberCard}>
          <span className={styles.memberPlate}>
            {m.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.photo} alt={m.name} className={styles.memberPhoto} />
            ) : (
              <span className={styles.memberInitials}>{initials(m.name)}</span>
            )}
          </span>
          <div className={styles.memberBody}>
            <h3 className={styles.memberName}>{m.name}</h3>
            {m.role && <p className={styles.memberRole}>{m.role}</p>}
            {m.bio && <p className={styles.memberText}>{m.bio}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}
