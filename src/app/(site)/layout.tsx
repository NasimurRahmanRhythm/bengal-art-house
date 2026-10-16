import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CartDrawer from "@/components/CartDrawer/CartDrawer";
import Preloader from "@/components/Preloader/Preloader";
import SmoothScroll from "@/components/motion/SmoothScroll";
import CustomCursor from "@/components/motion/CustomCursor";

// Every page under (site) is rendered on request: its server components read
// the database (src/lib/site-data.ts) each time the page is opened, so what is
// in Supabase is what the visitor sees — no build-time copies, no caching.
export const dynamic = "force-dynamic";

// The public gallery's chrome. Everything under (site) gets it; /admin does
// not — the dashboard is a workbench and stays on native scroll.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <CartProvider>
        <SmoothScroll />
        <CustomCursor />
        <Preloader />
        <a href="#main" className="srOnly">
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  );
}
