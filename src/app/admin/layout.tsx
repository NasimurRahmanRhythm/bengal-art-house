import type { Metadata } from "next";
// Quill's own stylesheet first, so admin.css can override it.
import "quill/dist/quill.snow.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Deliberately bare. Everything the dashboard needs — the sign-in check, the
// data store, the sidebar — lives in the (dashboard) group's layout instead, so
// that /admin/login can share this stylesheet without being wrapped in the very
// chrome it exists to let you reach.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
