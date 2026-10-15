import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CartDrawer from "@/components/CartDrawer/CartDrawer";
import Preloader from "@/components/Preloader/Preloader";
import SmoothScroll from "@/components/motion/SmoothScroll";
import CustomCursor from "@/components/motion/CustomCursor";

// Every page under (site) reads the database (src/lib/site-data.ts) and is
// regenerated at most this many seconds apart, so content added in Supabase
// or by a migration shows without a redeploy. Saves from the admin panel
// still refresh their pages at once. Pages that set their own `dynamic`
// (account, checkout result) are unaffected.
export const revalidate = 60;

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
