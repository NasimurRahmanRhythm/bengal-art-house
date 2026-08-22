import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Work_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-work-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.galleryhamiduzzaman.com"),
  title: {
    default: "Gallery Hamiduzzaman — Sculpture, Drawing & Public Art",
    template: "%s — Gallery Hamiduzzaman",
  },
  description:
    "Gallery Hamiduzzaman represents a growing circle of Bangladeshi sculptors and artists, carrying forward the modern sculpture tradition established by pioneers like Hamiduzzaman Khan (1946–2025).",
  keywords: [
    "Gallery Hamiduzzaman",
    "Hamiduzzaman Khan",
    "Bangladesh sculpture",
    "art gallery Dhaka",
    "sculpture park",
    "Ekushey Padak",
  ],
  openGraph: {
    title: "Gallery Hamiduzzaman",
    description:
      "Sculpture, drawing and public art from a growing circle of Bangladeshi artists — Dhaka, Bangladesh.",
    type: "website",
    locale: "en_GB",
  },
};

// Deliberately bare: only <html>/<body> and the font variables live here, so
// /admin can render its own chrome instead of inheriting the gallery's navbar,
// footer, preloader and cart. The public site's chrome is in (site)/layout.tsx.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
