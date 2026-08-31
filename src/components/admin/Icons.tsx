type P = { size?: number; className?: string };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const GaugeIcon = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
    <path d="M13.4 10.6L19 5M3 12a9 9 0 0118 0v6H3v-6z" />
  </svg>
);

export const PeopleIcon = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M16 20v-1.5A3.5 3.5 0 0012.5 15h-5A3.5 3.5 0 004 18.5V20" />
    <circle cx="10" cy="8" r="3.2" />
    <path d="M20 20v-1.5a3.5 3.5 0 00-2.6-3.4M15.5 5.2a3.2 3.2 0 010 5.6" />
  </svg>
);

export const FrameIcon = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    <path d="M3.5 15.5l4.2-4a1.6 1.6 0 012.2 0l6.6 6.4M14.5 12.6l1.4-1.3a1.6 1.6 0 012.2 0l2.4 2.3" />
    <circle cx="9" cy="8.6" r="1.3" />
  </svg>
);

export const CalendarIcon = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </svg>
);

export const MailIcon = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3.6 6.8l7.3 5.3a2 2 0 002.2 0l7.3-5.3" />
  </svg>
);

export const PlusIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const SearchIcon = ({ size = 15, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="10.7" cy="10.7" r="6.2" />
    <path d="M15.3 15.3L20 20" />
  </svg>
);

export const TrashIcon = ({ size = 15, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 0114.5 5v1.5M6.5 6.5l.8 12a1.5 1.5 0 001.5 1.4h6.4a1.5 1.5 0 001.5-1.4l.8-12" />
  </svg>
);

export const ChevronIcon = ({ size = 14, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const CheckIcon = ({ size = 15, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
);

export const EyeIcon = ({ size = 15, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const ExternalIcon = ({ size = 14, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M14 4.5h5.5V10M19 5l-8 8M18 13.5v5A1.5 1.5 0 0116.5 20h-11A1.5 1.5 0 014 18.5v-11A1.5 1.5 0 015.5 6h5" />
  </svg>
);

export const LockIcon = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 018 0v2.7" />
  </svg>
);

export const InfoIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8.2v.2" />
  </svg>
);

export const BagIcon = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4.5 7.5h15l-1.1 11.2a1.6 1.6 0 01-1.6 1.4H7.2a1.6 1.6 0 01-1.6-1.4L4.5 7.5z" />
    <path d="M8.8 10V7a3.2 3.2 0 016.4 0v3" />
  </svg>
);

export const PenIcon = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M15.4 4.6l4 4L8.6 19.4l-5 1 1-5L15.4 4.6z" />
    <path d="M13.6 6.4l4 4" />
  </svg>
);

export const CloseIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const CopyIcon = ({ size = 14, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 6.5V5.5A1.5 1.5 0 0013.5 4h-8A1.5 1.5 0 004 5.5v8A1.5 1.5 0 005.5 15h1" />
  </svg>
);

/* ------------------------------------------------------- editor toolbar */
/* Glyph-shaped rather than stroke-shaped, so B/I/U read as the letters the
   button applies. They keep currentColor so the pressed state still works. */

const glyph = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "currentColor",
});

export const BoldIcon = ({ size = 16, className }: P) => (
  <svg {...glyph(size)} className={className}>
    <text x="12" y="17.5" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="serif">
      B
    </text>
  </svg>
);

export const ItalicIcon = ({ size = 16, className }: P) => (
  <svg {...glyph(size)} className={className}>
    <text
      x="12"
      y="17.5"
      textAnchor="middle"
      fontSize="15"
      fontStyle="italic"
      fontFamily="serif"
    >
      I
    </text>
  </svg>
);

export const UnderlineIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M7 4.5v6a5 5 0 0010 0v-6M5.5 19.5h13" />
  </svg>
);

export const StrikeIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4.5 12h15" />
    <path d="M16.5 7.4A4.3 4.3 0 0012.4 5C9.9 5 8 6.3 8 8.2c0 1.5 1.2 2.5 3.4 3.1M7.4 16a4.5 4.5 0 004.4 2.6c2.7 0 4.6-1.3 4.6-3.2 0-.9-.3-1.6-1-2.2" />
  </svg>
);

export const QuoteIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 17V9.5A2.5 2.5 0 017.5 7H9M5 12h4M15 17V9.5A2.5 2.5 0 0117.5 7H19M15 12h4" />
  </svg>
);

export const ListIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M9 7h11M9 12h11M9 17h11" />
    <circle cx="4.6" cy="7" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="4.6" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="4.6" cy="17" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const OrderedListIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M9.5 7h10.5M9.5 12h10.5M9.5 17h10.5" />
    <path d="M3.4 5.6l1.3-.6V9M3.2 11.2a1.4 1.4 0 012.3 1c0 .9-2.3 1.6-2.3 2.6h2.5M3.3 15.6h2.2l-1.3 1.5c.8 0 1.4.4 1.4 1.1s-.6 1.2-1.4 1.2a1.7 1.7 0 01-1.2-.5" />
  </svg>
);

export const LinkIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M10.2 13.8a3.6 3.6 0 005.4.4l2.6-2.6a3.6 3.6 0 00-5.1-5.1l-1.5 1.5" />
    <path d="M13.8 10.2a3.6 3.6 0 00-5.4-.4l-2.6 2.6a3.6 3.6 0 005.1 5.1l1.5-1.5" />
  </svg>
);

export const ImageIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3.5" y="5" width="17" height="14" rx="2" />
    <path d="M3.5 15.4l3.7-3.5a1.6 1.6 0 012.2 0l5.4 5.1M14 13.4l1.6-1.5a1.6 1.6 0 012.2 0l2.7 2.5" />
    <circle cx="8.6" cy="9.4" r="1.3" />
  </svg>
);

export const RuleIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3.5 12h17M6.5 7h11M6.5 17h11" opacity="0.45" />
    <path d="M3.5 12h17" />
  </svg>
);

export const UndoIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 9.5h9.5a5 5 0 010 10H8" />
    <path d="M7.5 5.5L3.5 9.5l4 4" />
  </svg>
);

export const RedoIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M20 9.5h-9.5a5 5 0 000 10H16" />
    <path d="M16.5 5.5l4 4-4 4" />
  </svg>
);

export const ClearFormatIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M8.5 5.5h10M12.6 5.8L9.4 18.5M6.5 18.5h6.5" />
    <path d="M15.5 14.5l4.5 4.5M20 14.5l-4.5 4.5" />
  </svg>
);

export const AlignLeftIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6.5h16M4 11h10M4 15.5h16M4 20h10" />
  </svg>
);

export const AlignCenterIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6.5h16M7 11h10M4 15.5h16M7 20h10" />
  </svg>
);

export const AlignRightIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6.5h16M10 11h10M4 15.5h16M10 20h10" />
  </svg>
);

export const AlignJustifyIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6.5h16M4 11h16M4 15.5h16M4 20h16" />
  </svg>
);

export const IndentIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M10 6.5h10M10 12h10M10 17.5h10M4 6.5h2M4 17.5h2" />
    <path d="M4 9.5l3 2.5-3 2.5z" fill="currentColor" stroke="none" />
  </svg>
);

export const OutdentIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M10 6.5h10M10 12h10M10 17.5h10M4 6.5h2M4 17.5h2" />
    <path d="M7 9.5l-3 2.5 3 2.5z" fill="currentColor" stroke="none" />
  </svg>
);

export const TextColorIcon = ({ size = 16, className }: P) => (
  <svg {...glyph(size)} className={className}>
    <text x="12" y="15" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="serif">
      A
    </text>
  </svg>
);

export const HighlightIcon = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M14.5 4.5l5 5-7.6 7.6-5-5L14.5 4.5z" />
    <path d="M6.9 12.1l-2 4.4 4.4 2 2.1-2.1" />
  </svg>
);

export const NewsIcon = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 5.5h12a2 2 0 012 2V17a1.5 1.5 0 001.5 1.5H6a2 2 0 01-2-2v-11z" />
    <path d="M18 18.5A1.5 1.5 0 0119.5 17V9.5H18" />
    <path d="M7 9h6M7 12.3h6M7 15.5h4" />
  </svg>
);
