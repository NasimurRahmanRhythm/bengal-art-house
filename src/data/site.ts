export const SITE = {
  name: "Gallery Hamiduzzaman",
  shortName: "GH",
  tagline: "Representing Bangladeshi sculpture, drawing & public art",
  phone: "+880 1817-030100",
  phoneHref: "+8801817030100",
  address: "House 02, Rd 104, Gulshan 2, Dhaka 1212",
  // The gallery's Google Maps listing, opened by every "Get directions" link.
  mapUrl: "https://maps.google.com/?ftid=0x3755c700229ff71f:0xa2ffeb2be3e73883",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=House%2002%2C%20Road%20104%2C%20Gulshan%202%2C%20Dhaka%201212&z=16&output=embed",
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
  { label: "Governing Body", href: "/governing-body" },
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
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC0Y2pdqUqOBhA9tBdJniYOg",
    icon: "youtube" as const,
  },
];

export const FOOTER_EXPLORE = [
  { label: "Sculptures", href: "/about#sculptures" },
  { label: "Exhibitions", href: "/exhibitions" },
  { label: "Sculpture Park", href: "/#park" },
  { label: "About the Gallery", href: "/about" },
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
