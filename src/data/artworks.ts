export type ArtGroup = "bronze" | "stone" | "steel" | "paper";

export type Artwork = {
  id: string;
  group: ArtGroup;
  title: string;
  artist: string;
  medium: string;
  price: number;
  status: "available" | "sold";
  plate: number;
  photo?: string;
  year: string;
  dimensions: string;
  note: string;
};

export const ARTWORKS: Artwork[] = [
  {
    id: "untitled-abstract-form",
    group: "steel",
    title: "Untitled Abstract Form",
    artist: "Hamiduzzaman Khan",
    medium: "Painted wood & steel, studio edition",
    price: 180000,
    status: "available",
    plate: 0,
    photo: "/images/sculpture.jpg",
    year: "c. 1998",
    dimensions: "62 × 21 × 18 cm",
    note: "A studio-scale study in the standing form — the silhouette he returned to across four decades of public work.",
  },
  {
    id: "bird-study-ii",
    group: "bronze",
    title: "Bird Study II",
    artist: "Hamiduzzaman Khan",
    medium: "Bronze, small edition",
    price: 250000,
    status: "available",
    plate: 1,
    year: "2004",
    dimensions: "44 × 38 × 16 cm",
    note: "Birds ran through his practice as a motif of release. Cast in bronze from a mild steel maquette.",
  },
  {
    id: "riverline-watercolour",
    group: "paper",
    title: "Riverline (Watercolour Series)",
    artist: "Hamiduzzaman Khan",
    medium: "Watercolour on paper, framed",
    price: 65000,
    status: "available",
    plate: 2,
    year: "1991",
    dimensions: "38 × 56 cm, framed",
    note: "From the riverine watercolours made on travel through Kishoreganj — sculpture rehearsed on paper.",
  },
  {
    id: "black-granite-form",
    group: "stone",
    title: "Black Granite Form",
    artist: "Hamiduzzaman Khan",
    medium: "Black granite, single eye motif",
    price: 320000,
    status: "sold",
    plate: 3,
    year: "1986",
    dimensions: "51 × 30 × 30 cm",
    note: "Carved from a single block, pierced by the eye motif that recurs across his granite work.",
  },
  {
    id: "seated-form",
    group: "stone",
    title: "Seated Form",
    artist: "Ivy Zaman",
    medium: "Marble di Carrara, small scale",
    price: 210000,
    status: "available",
    plate: 4,
    year: "2009",
    dimensions: "34 × 26 × 22 cm",
    note: "A compact seated figure in Carrara marble, polished to a soft shoulder line.",
  },
  {
    id: "sketch-for-shangshaptok",
    group: "paper",
    title: "Sketch for Shangshaptok",
    artist: "Hamiduzzaman Khan",
    medium: "Graphite & ink on paper, archival",
    price: 95000,
    status: "available",
    plate: 5,
    year: "1988",
    dimensions: "42 × 30 cm",
    note: "A working drawing for the Jahangirnagar University monument — the structure resolved before the pour.",
  },
  {
    id: "wing-fragment",
    group: "steel",
    title: "Wing Fragment",
    artist: "Hamiduzzaman Khan",
    medium: "Mild steel, welded plate",
    price: 145000,
    status: "available",
    plate: 6,
    year: "2013",
    dimensions: "58 × 40 × 24 cm",
    note: "Welded from cut plate and left to weather — the rust surface was intended, not neglected.",
  },
  {
    id: "steps-maquette",
    group: "stone",
    title: "Steps (Maquette)",
    artist: "Hamiduzzaman Khan",
    medium: "Cast stone, artist's maquette",
    price: 275000,
    status: "sold",
    plate: 7,
    year: "1987",
    dimensions: "40 × 40 × 28 cm",
    note: "The working model for the stone work installed permanently at Seoul Olympic Park in 1988.",
  },
  {
    id: "study-in-patina",
    group: "bronze",
    title: "Study in Patina",
    artist: "Zubair Khan",
    medium: "Bronze on granite base",
    price: 118000,
    status: "available",
    plate: 8,
    year: "2021",
    dimensions: "29 × 18 × 18 cm",
    note: "From the studio's continuing practice — a small bronze finished in the green patina of the park works.",
  },
];

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
