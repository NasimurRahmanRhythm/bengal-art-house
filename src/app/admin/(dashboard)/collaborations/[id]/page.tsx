"use client";

import { use } from "react";
import Link from "next/link";
import CollaborationForm from "@/components/admin/CollaborationForm";
import { Topbar } from "@/components/admin/AdminShell";
import { Empty } from "@/components/admin/ui";
import { useAdmin } from "@/lib/admin/store";

export default function EditCollaboration({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, hydrated } = useAdmin();
  const collaboration = data.collaborations.find((c) => c.id === id);

  if (!collaboration) {
    if (!hydrated) return null;
    return (
      <>
        <Topbar
          title="Not found"
          parent={{ href: "/admin/collaborations", label: "Collaborations" }}
        />
        <div className="a-body">
          <div className="a-card">
            <Empty title="That collaboration no longer exists">
              <p style={{ marginBottom: 14 }}>It may have been deleted.</p>
              <Link href="/admin/collaborations" className="a-btn">
                Back to collaborations
              </Link>
            </Empty>
          </div>
        </div>
      </>
    );
  }

  return <CollaborationForm collaboration={collaboration} />;
}
