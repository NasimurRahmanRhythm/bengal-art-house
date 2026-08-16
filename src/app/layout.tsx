import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Work_Sans } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CartDrawer from "@/components/CartDrawer/CartDrawer";
import Preloader from "@/components/Preloader/Preloader";

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
  metadataBase: new URL("https://bengalarthouse.example"),
  title: {
    default: "Bengal Art House — Sculpture, Drawing & Public Art",
    template: "%s — Bengal Art House",
  },
  description:
    "Bengal Art House represents a growing circle of Bangladeshi sculptors and artists, carrying forward the modern sculpture tradition established by pioneers like Hamiduzzaman Khan (1946–2025).",
  keywords: [
    "Bengal Art House",
    "Hamiduzzaman Khan",
    "Bangladesh sculpture",
    "art gallery Dhaka",
    "sculpture park",
    "Ekushey Padak",
  ],
  openGraph: {
    title: "Bengal Art House",
    description:
      "Sculpture, drawing and public art from a growing circle of Bangladeshi artists — Dhaka, Bangladesh.",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body>
        <CartProvider>
          <Preloader />
          <a href="#main" className="srOnly">
            Skip to content
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
