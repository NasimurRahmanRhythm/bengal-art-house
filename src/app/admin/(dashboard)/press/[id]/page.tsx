"use client";

import { use } from "react";
import Link from "next/link";
import PressForm from "@/components/admin/PressForm";
import { Topbar } from "@/components/admin/AdminShell";
import { Empty } from "@/components/admin/ui";
import { useAdmin } from "@/lib/admin/store";

export default function EditPressRelease({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, hydrated } = useAdmin();
  const release = data.pressReleases.find((p) => p.id === id);

  if (!release) {
    if (!hydrated) return null;
    return (
      <>
        <Topbar title="Not found" parent={{ href: "/admin/press", label: "Media & Press Release" }} />
        <div className="a-body">
          <div className="a-card">
            <Empty title="That item no longer exists">
              <p style={{ marginBottom: 14 }}>It may have been deleted.</p>
              <Link href="/admin/press" className="a-btn">
                Back to Media & Press Release
              </Link>
            </Empty>
          </div>
        </div>
      </>
    );
  }

  return <PressForm release={release} />;
}
