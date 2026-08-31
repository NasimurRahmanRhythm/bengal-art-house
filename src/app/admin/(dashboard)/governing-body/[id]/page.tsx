"use client";

import { use } from "react";
import Link from "next/link";
import MemberForm from "@/components/admin/MemberForm";
import { Topbar } from "@/components/admin/AdminShell";
import { Empty } from "@/components/admin/ui";
import { useAdmin } from "@/lib/admin/store";

export default function EditMember({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, hydrated } = useAdmin();
  const member = data.governingBody.find((m) => m.id === id);

  if (!member) {
    if (!hydrated) return null;
    return (
      <>
        <Topbar
          title="Not found"
          parent={{ href: "/admin/governing-body", label: "Governing Body" }}
        />
        <div className="a-body">
          <div className="a-card">
            <Empty title="That member no longer exists">
              <p style={{ marginBottom: 14 }}>They may have been removed.</p>
              <Link href="/admin/governing-body" className="a-btn">
                Back to the governing body
              </Link>
            </Empty>
          </div>
        </div>
      </>
    );
  }

  return <MemberForm member={member} />;
}
