import type { ReactNode } from "react";
import SplitHeading from "@/components/motion/SplitHeading";
import Reveal from "@/components/motion/Reveal";

type SectionHeadProps = {
  kicker: string;
  title: ReactNode;
  body?: string;
  /** Extra content pinned to the right column, under the body copy. */
  aside?: ReactNode;
};

/** The two-column heading used at the top of most sections. */
export default function SectionHead({ kicker, title, body, aside }: SectionHeadProps) {
  return (
    <div className="sectionHead">
      <div>
        <span className="kicker">{kicker}</span>
        <SplitHeading as="h2">{title}</SplitHeading>
      </div>
      <div>
        {body && (
          <Reveal delay={0.15}>
            <p>{body}</p>
          </Reveal>
        )}
        {aside}
      </div>
    </div>
  );
}
