import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CartDrawer from "@/components/CartDrawer/CartDrawer";
import Preloader from "@/components/Preloader/Preloader";
import SmoothScroll from "@/components/motion/SmoothScroll";
import CustomCursor from "@/components/motion/CustomCursor";

// The public gallery's chrome. Everything under (site) gets it; /admin does
// not — the dashboard is a workbench and stays on native scroll.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
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
  );
}
