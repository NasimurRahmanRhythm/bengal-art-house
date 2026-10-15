// The four the artworks page filters by. Fixed on purpose — unlike `material`,
// this has to mean the same thing on every row for the filter to be worth
// anything.
export const CATEGORIES = ["Calligraphy", "Installation", "Paintings", "Sculpture"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Artwork = {
  id: string;
  title: string;
  artist: string;
  category: Category | "";
  // Short, and free text — the gallery types it in its own words. The filter
  // chips on /artworks are built from whichever values actually appear, so a
  // piece in a new material brings its own chip with it, without a code change.
  material: string;
  medium: string;
  price: number;
  status: "available" | "sold";
  plate: number;
  photo?: string;
  year: string;
  dimensions: string;
  note: string;
};


export type Medium = { tag: string; title: string; blurb: string; count: number };

export const MEDIUMS: Medium[] = [
  {
    tag: "Cast",
    title: "Bronze & Cast Metal",
    blurb: "Editions and one-offs poured from steel and wax maquettes.",
    count: 24,
  },
  {
    tag: "Carved",
    title: "Granite & Marble",
    blurb: "Direct carving — black granite, and Carrara brought back from travel.",
    count: 17,
  },
  {
    tag: "Welded",
    title: "Mild & Stainless Steel",
    blurb: "Cut plate, welded and weathered, the language of the public works.",
    count: 31,
  },
  {
    tag: "On paper",
    title: "Watercolour & Drawing",
    blurb: "Riverine landscapes and the working sketches behind the monuments.",
    count: 46,
  },
];

export function formatBDT(amount: number): string {
  return `BDT ${amount.toLocaleString("en-US")}`;
}
