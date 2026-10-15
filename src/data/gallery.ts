
export type Work = {
  index: string;
  title: string;
  medium: string;
  location: string;
};


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
  photo?: string;
  photos?: string[];
  entry?: string;
  hours?: string;
};


// The people who run the gallery, from the governing_body table.
export type GoverningMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo?: string;
};


// A partner exhibition or project, as the public pages show it — from the
// collaborations table, added in the admin panel.
export type Collaboration = {
  slug: string;
  title: string;
  subtitle: string;
  artists: string;
  place: string;
  /** Display dates: "28 April — 6 May 2017", or just the year. */
  date: string;
  /** The write-up, paragraphs separated by a blank line. */
  body: string;
  photos: string[];
};

export type Service = {
  title: string;
  body: string;
  icon: "advisory" | "catalog" | "restore" | "provenance" | "public" | "valuation";
};


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
  // Optional: an artist without a portrait gets the generated plate instead.
  photo?: string;
};

