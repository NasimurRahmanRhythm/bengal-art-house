"use client";

import { use } from "react";
import Link from "next/link";
import ArtistForm from "@/components/admin/ArtistForm";
import { Topbar } from "@/components/admin/AdminShell";
import { Empty } from "@/components/admin/ui";
import { useAdmin } from "@/lib/admin/store";

export default function EditArtist({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, hydrated } = useAdmin();
  const artist = data.artists.find((a) => a.id === id);

  if (!artist) {
    if (!hydrated) return null;
    return (
      <>
        <Topbar title="Not found" parent={{ href: "/admin/artists", label: "Artists" }} />
        <div className="a-body">
          <div className="a-card">
            <Empty title="That artist no longer exists">
              <p style={{ marginBottom: 14 }}>It may have been deleted.</p>
              <Link href="/admin/artists" className="a-btn">
                Back to artists
              </Link>
            </Empty>
          </div>
        </div>
      </>
    );
  }

  return <ArtistForm artist={artist} />;
}
