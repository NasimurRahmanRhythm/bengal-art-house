import { redirect } from "next/navigation";
import { AdminStoreProvider } from "@/lib/admin/store";
import AdminShell from "@/components/admin/AdminShell";
import { checkAdmin } from "@/lib/admin/auth";

// Every dashboard page renders through here, so this is the gate. Middleware
// turns most unauthorised requests away before they reach a page at all; this
// runs anyway, because a route matcher is a configuration file and a gate that
// only exists in configuration is one edit away from not existing.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await checkAdmin();

  if (!session.ok) {
    redirect(session.reason === "expired" ? "/admin/login?expired=1" : "/admin/login");
  }

  return (
    <AdminStoreProvider>
      <AdminShell email={session.email}>{children}</AdminShell>
    </AdminStoreProvider>
  );
}
