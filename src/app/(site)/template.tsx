"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import styles from "./template.module.css";

export default function Template({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setEntered(true);
  }, []);

  return (
    <div
      className={`${styles.pageContent} ${entered ? styles.entered : ""}`}
      onTransitionEnd={() => ScrollTrigger.refresh()}
    >
      <span className={styles.routeSeam} aria-hidden="true" />
      {children}
    </div>
  );
}
