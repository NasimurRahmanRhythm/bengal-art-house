"use client";

import { use } from "react";
import Link from "next/link";
import ExhibitionForm from "@/components/admin/ExhibitionForm";
import { Topbar } from "@/components/admin/AdminShell";
import { Empty } from "@/components/admin/ui";
import { useAdmin } from "@/lib/admin/store";

export default function EditExhibition({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, hydrated } = useAdmin();
  const exhibition = data.exhibitions.find((e) => e.id === id);

  if (!exhibition) {
    if (!hydrated) return null;
    return (
      <>
        <Topbar title="Not found" parent={{ href: "/admin/exhibitions", label: "Exhibitions" }} />
        <div className="a-body">
          <div className="a-card">
            <Empty title="That exhibition no longer exists">
              <p style={{ marginBottom: 14 }}>It may have been deleted.</p>
              <Link href="/admin/exhibitions" className="a-btn">
                Back to exhibitions
              </Link>
            </Empty>
          </div>
        </div>
      </>
    );
  }

  return <ExhibitionForm exhibition={exhibition} />;
}
