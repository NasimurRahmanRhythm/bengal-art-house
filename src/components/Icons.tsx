type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true as const,
  focusable: "false" as const,
});

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const CartIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6" {...stroke} />
    <circle cx="10" cy="21" r="1.3" fill="currentColor" />
    <circle cx="18" cy="21" r="1.3" fill="currentColor" />
  </svg>
);

export const UserIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...stroke} />
    <circle cx="12" cy="7" r="4" {...stroke} />
  </svg>
);

export const ArrowIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" {...stroke} />
  </svg>
);

export const CloseIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6L6 18" {...stroke} />
  </svg>
);

export const PlusIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" {...stroke} />
  </svg>
);

export const ChevronIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 9l6 6 6-6" {...stroke} />
  </svg>
);

export const EyeIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" {...stroke} />
    <circle cx="12" cy="12" r="2.8" {...stroke} />
  </svg>
);

export const SOCIAL_ICONS = {
  facebook: ({ size = 15, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path
        d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
        fill="currentColor"
      />
    </svg>
  ),
  instagram: ({ size = 15, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" {...stroke} />
      <circle cx="12" cy="12" r="3.6" {...stroke} />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  ),
  linkedin: ({ size = 15, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-13h4z" fill="currentColor" />
      <rect x="2" y="9" width="4" height="12" fill="currentColor" />
      <circle cx="4" cy="4" r="2" fill="currentColor" />
    </svg>
  ),
  youtube: ({ size = 15, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path
        d="M22.5 7.4a3 3 0 0 0-2.1-2.1C18.5 4.8 12 4.8 12 4.8s-6.5 0-8.4.5A3 3 0 0 0 1.5 7.4 31 31 0 0 0 1 12a31 31 0 0 0 .5 4.6 3 3 0 0 0 2.1 2.1c1.9.5 8.4.5 8.4.5s6.5 0 8.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-4.6z"
        fill="currentColor"
      />
      <path d="M10 15.2V8.8l5.2 3.2z" fill="var(--marble, #fff)" />
    </svg>
  ),
  // Post-rebrand mark: the X wordmark, not the old Twitter bird.
  x: ({ size = 15, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path
        d="M17.2 3h3.3l-7.2 8.3L21.8 21h-6.6l-5.2-6.8L4.1 21H.8l7.7-8.8L.5 3h6.8l4.7 6.2zm-1.2 16h1.8L6.9 4.8H5z"
        fill="currentColor"
      />
    </svg>
  ),
} as const;

export const SERVICE_ICONS = {
  advisory: ({ size = 26, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M4 20V10M12 20V4M20 20v-7" {...stroke} />
    </svg>
  ),
  catalog: ({ size = 26, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M4 6h16M4 12h16M4 18h10" {...stroke} />
    </svg>
  ),
  restore: ({ size = 26, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M12 8v4l3 2" {...stroke} />
    </svg>
  ),
  provenance: ({ size = 26, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M6 3v18M18 3v18M6 8h12M6 16h12" {...stroke} />
    </svg>
  ),
  public: ({ size = 26, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M12 3l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1z" {...stroke} />
    </svg>
  ),
  valuation: ({ size = 26, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <rect x="4" y="4" width="16" height="16" {...stroke} />
      <path d="M4 9h16M9 9v11" {...stroke} />
    </svg>
  ),
} as const;
