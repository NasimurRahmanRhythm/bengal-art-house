"use client";

import { use } from "react";
import Link from "next/link";
import ArtworkForm from "@/components/admin/ArtworkForm";
import { Topbar } from "@/components/admin/AdminShell";
import { Empty } from "@/components/admin/ui";
import { useAdmin } from "@/lib/admin/store";

export default function EditArtwork({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, hydrated } = useAdmin();
  const artwork = data.artworks.find((w) => w.id === id);

  if (!artwork) {
    // Before localStorage is read the seed is in state, so a piece added in a
    // previous session would briefly look missing. Wait for hydration first.
    if (!hydrated) return null;
    return (
      <>
        <Topbar title="Not found" parent={{ href: "/admin/artworks", label: "Artworks" }} />
        <div className="a-body">
          <div className="a-card">
            <Empty title="That artwork no longer exists">
              <p style={{ marginBottom: 14 }}>It may have been deleted.</p>
              <Link href="/admin/artworks" className="a-btn">
                Back to artworks
              </Link>
            </Empty>
          </div>
        </div>
      </>
    );
  }

  return <ArtworkForm artwork={artwork} />;
}
