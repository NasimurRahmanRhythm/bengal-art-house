import type { ReactNode } from "react";
import SplitHeading from "@/components/motion/SplitHeading";
import Reveal from "@/components/motion/Reveal";

type SectionHeadProps = {
  kicker: string;
  title: ReactNode;
  body?: string;
  aside?: ReactNode;
};

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
