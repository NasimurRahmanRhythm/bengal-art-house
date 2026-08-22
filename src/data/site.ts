export const SITE = {
  name: "Gallery Hamiduzzaman",
  shortName: "GH",
  tagline: "Representing Bangladeshi sculpture, drawing & public art",
  email: "info@galleryhamiduzzaman.example",
  phone: "+880 0000 000000",
  phoneHref: "+8800000000000",
  address: "Dhanmondi, Dhaka, Bangladesh",
  established: "Dhaka, Bangladesh — Est. 2026",
} as const;

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; note: string }[];
};

export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Explore Art",
    href: "/artworks",
    children: [
      { label: "Artworks", href: "/artworks", note: "Available for acquisition" },
      { label: "Artists", href: "/artists", note: "The studio and its circle" },
    ],
  },
  { label: "Exhibitions", href: "/exhibitions" },
  { label: "Collaborations", href: "/collaborations" },
  { label: "Blog", href: "/blog" },
  { label: "Press", href: "/press" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// The gallery's live profiles. Drop a row to hide that icon everywhere — the
// navbar, the mobile panel and the footer all render straight from this list.
export const SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100093228696724",
    icon: "facebook" as const,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/gallery.hamiduzzaman/",
    icon: "instagram" as const,
  },
  { label: "X", href: "https://x.com/g_hamiduzzaman", icon: "x" as const },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/gallery-hamiduzzaman-256203430/",
    icon: "linkedin" as const,
  },
];

export const FOOTER_EXPLORE = [
  { label: "Sculptures", href: "/about#sculptures" },
  { label: "Exhibitions", href: "/exhibitions" },
  { label: "Sculpture Park", href: "/#park" },
  { label: "About the Gallery", href: "/about" },
];

export const FOOTER_POLICY = [
  { label: "Terms", href: "/contact" },
  { label: "Privacy", href: "/contact" },
  { label: "Returns", href: "/contact" },
];

export const MATERIALS = [
  "Bronze",
  "Granite",
  "Mild Steel",
  "Marble",
  "Stainless Steel",
  "Watercolour",
  "Concrete",
  "Steel Wire",
];
