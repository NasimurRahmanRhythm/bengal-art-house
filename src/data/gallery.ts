
export type Work = {
  index: string;
  title: string;
  medium: string;
  location: string;
};

export const WORKS: Work[] = [
  {
    index: "01",
    title: "Shangshaptok",
    medium: "Concrete & steel",
    location: "Jahangirnagar University — spirit of the Liberation War",
  },
  {
    index: "02",
    title: "Remembrance '71",
    medium: "Bronze",
    location: "First cast 1976 — reworked across three decades",
  },
  {
    index: "03",
    title: "Steps",
    medium: "Stone, abstract form",
    location: "Seoul Olympic Park, South Korea — 1988",
  },
  {
    index: "04",
    title: "Shantir Payra (Peace Bird)",
    medium: "Stainless steel",
    location: "TSC, University of Dhaka",
  },
  { index: "05", title: "Jagroto Bangla", medium: "Mixed metal", location: "Brahmanbaria" },
  {
    index: "06",
    title: "Waiting Mother",
    medium: "Rusted mild steel",
    location: "A mother awaiting her son's return from 1971",
  },
  {
    index: "07",
    title: "Mukta Bangla",
    medium: "Stainless steel — 2011",
    location: "Patuakhali Science & Technology University",
  },
  { index: "08", title: "Freedom", medium: "Stone", location: "Krishibid Institute, Dhaka" },
  { index: "09", title: "Flying Bird", medium: "Steel", location: "World Bank Dhaka Office" },
];

export type Exhibition = {
  id: string;
  year: string;
  date: string;
  title: string;
  venue: string;
  tag: string;
  status: "current" | "upcoming" | "past";
  plate: number;
  blurb: string;
};

export const EXHIBITIONS: Exhibition[] = [
  {
    id: "retrospective",
    year: "2025",
    date: "14 August — 4 September 2025",
    title: "Hamiduzzaman Khan Retrospective",
    venue: "Nalinikanta Bhattashali Gallery, Bangladesh National Museum",
    tag: "Sculpture · Painting · Print",
    status: "current",
    plate: 1,
    blurb:
      "Five decades gathered in one room — the maquettes, the drawings, and the prints that stood behind the monuments.",
  },
  {
    id: "artistic-journey",
    year: "2025",
    date: "12 September — 3 October 2025",
    title: "An Artistic Journey",
    venue: "Bengal Shilpalay, Dhanmondi, Dhaka",
    tag: "Sculpture & Sketches",
    status: "upcoming",
    plate: 6,
    blurb:
      "Sculpture shown alongside the sketchbooks, tracing how a line on paper becomes a form in steel.",
  },
  {
    id: "birth-anniversary",
    year: "2016",
    date: "21 December 2016",
    title: "70th Birth Anniversary Exhibition",
    venue: "Galleri Kaya, Dhaka",
    tag: "Solo Sculpture",
    status: "past",
    plate: 3,
    blurb:
      "A solo survey mounted for his seventieth year, drawn largely from the artist's own collection.",
  },
  {
    id: "first-national",
    year: "1976",
    date: "1976",
    title: "First National Sculpture Exhibition",
    venue: "Bangladesh Shilpakala Academy — Best Award",
    tag: "Group · Award",
    status: "past",
    plate: 7,
    blurb:
      "The exhibition that announced sculpture as a national practice — and took the Best Award home.",
  },
  {
    id: "riverine",
    year: "1991",
    date: "1991",
    title: "Riverine: Watercolours",
    venue: "Shilpakala Academy, Dhaka",
    tag: "Works on Paper",
    status: "past",
    plate: 2,
    blurb:
      "The watercolours made on the rivers of Kishoreganj, shown together for the first and only time.",
  },
];

export type Collaboration = {
  place: string;
  title: string;
  body: string;
  years: string;
};

export const COLLABORATIONS: Collaboration[] = [
  {
    place: "Baroda, India",
    title: "M.S. University of Baroda",
    body: "Completed his master's degree in 1976 under master artists, deepening his command of form and material.",
    years: "1974–1976",
  },
  {
    place: "Seoul, Korea",
    title: "Seoul Olympic Park",
    body: 'His abstract stone work "Steps" was installed permanently in the Olympic Park, bringing his practice to an international audience.',
    years: "1988",
  },
  {
    place: "United States & Europe",
    title: "Study of Public & Abstract Sculpture",
    body: "A formative visit exposed him to abstract form and its relationship to public space and the urban landscape.",
    years: "Early 1980s",
  },
  {
    place: "Middle East & North Africa",
    title: "Stone Carving Exchange",
    body: "Travelled to learn traditional stone-carving techniques, later folded into his own treatment of granite and marble.",
    years: "1980s",
  },
];

export type Service = {
  title: string;
  body: string;
  icon: "advisory" | "catalog" | "restore" | "provenance" | "public" | "valuation";
};

export const SERVICES: Service[] = [
  {
    title: "Art Advisory",
    body: "Guidance for patrons and institutions collecting or investing in sculpture and works on paper.",
    icon: "advisory",
  },
  {
    title: "Cataloging & Documentation",
    body: "High-quality imaging, titling and archival records for public and private collections of his work.",
    icon: "catalog",
  },
  {
    title: "Restoration & Conservation",
    body: "Care for stone, bronze and steel works exposed to years of open-air installation and weather.",
    icon: "restore",
  },
  {
    title: "Provenance & Authentication",
    body: "Verification support for works attributed to the artist, addressing a real concern across the region.",
    icon: "provenance",
  },
  {
    title: "Public Art Consultation",
    body: "Advice for institutions and campuses commissioning or siting monumental sculpture in public space.",
    icon: "public",
  },
  {
    title: "Valuation",
    body: "Assessment of current market valuation for sculpture and works on paper, with a written report.",
    icon: "valuation",
  },
];

export const FACTS = [
  { label: "Born", value: "16 March 1946, Kishoreganj" },
  { label: "Mentor", value: "Zainul Abedin" },
  { label: "Recognition", value: "Ekushey Padak, 2006" },
  { label: "Faculty", value: "Fine Arts, Dhaka University" },
];

export const BIO = [
  "Born in 1946 in Sahasram, Kishoreganj, Hamiduzzaman Khan graduated from Dhaka Art College in 1967 and studied under Shilpacharya Zainul Abedin before earning a master's degree from the M.S. University of Baroda, India, in 1976. A journey through Europe and the United States in the early 1980s exposed him to abstract public sculpture — a language he brought home and made his own.",
  "Building on the modernist path opened by Novera Ahmed, he became a founding figure of sculpture in Bangladesh, popularising sculpture parks and integrating monumental form into the country's campuses, institutes and public squares. His themes returned again and again to the Liberation War of 1971 and to birds — motifs he carved in granite, marble, bronze, mild steel and stainless steel.",
];

export type ArtistFact = { label: string; value: string };

export type Artist = {
  slug: string;
  initials: string;
  name: string;
  role: string;
  body: string;
  bio: string[];
  facts: ArtistFact[];
  works: string;
  plate: number;
};

export const ARTISTS: Artist[] = [
  {
    slug: "hamiduzzaman-khan",
    initials: "HK",
    name: "Hamiduzzaman Khan",
    role: "Founder · Sculptor, 1946–2025",
    body: "Founding figure of modern sculpture in Bangladesh, working across bronze, stone and steel for five decades.",
    bio: BIO,
    facts: FACTS,
    works: "6 works in the gallery",
    plate: 0,
  },
  {
    slug: "ivy-zaman",
    initials: "IZ",
    name: "Ivy Zaman",
    role: "Sculptor",
    body: "Sculptor in her own right, with works shown in Bangladesh, Korea and India alongside her husband's practice.",
    bio: [
      "Ivy Zaman studied sculpture alongside Hamiduzzaman Khan, developing her own practice in marble and granite even as she supported his public commissions. Where his work reached for monumental, public scale, hers has stayed closer to the studio — compact seated and reclining forms carved directly from stone, finished by hand.",
      "Her work has been shown in Bangladesh, South Korea and India. She continues to carve from the family studio in Dhaka, and has taken an increasing role in advising the gallery's collectors on stone and marble acquisitions.",
    ],
    facts: [
      { label: "Practice", value: "Marble & granite, direct carving" },
      { label: "Based in", value: "Dhaka, Bangladesh" },
      { label: "Exhibited", value: "Bangladesh, South Korea, India" },
      { label: "Role", value: "Sculptor & advisory" },
    ],
    works: "1 work in the gallery",
    plate: 4,
  },
  {
    slug: "zubair-khan",
    initials: "ZK",
    name: "Zubair Khan",
    role: "Studio & Archive",
    body: "Continuing the documentation and stewardship of his father's public works, alongside his own studio practice.",
    bio: [
      "Zubair Khan grew up around his father's studio and, together with his brother Zarif, now leads the work of cataloguing, conserving and exhibiting Hamiduzzaman Khan's public sculptures — the archive that underpins the gallery's authentication and restoration services.",
      "His own practice extends the studio's material language into smaller, contemporary bronze forms, often finished in the same green patina used across the sculpture park's outdoor works.",
    ],
    facts: [
      { label: "Practice", value: "Bronze, cast on granite" },
      { label: "Based in", value: "Dhaka, Bangladesh" },
      { label: "Focus", value: "Documentation & conservation" },
      { label: "Role", value: "Studio & archive" },
    ],
    works: "1 work in the gallery",
    plate: 8,
  },
];
