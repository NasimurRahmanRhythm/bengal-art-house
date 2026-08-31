"use client";

import { use } from "react";
import Link from "next/link";
import PostForm from "@/components/admin/PostForm";
import { Topbar } from "@/components/admin/AdminShell";
import { Empty } from "@/components/admin/ui";
import { useAdmin } from "@/lib/admin/store";

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, hydrated } = useAdmin();
  const post = data.posts.find((p) => p.id === id);

  if (!post) {
    if (!hydrated) return null;
    return (
      <>
        <Topbar title="Not found" parent={{ href: "/admin/blog", label: "Blog" }} />
        <div className="a-body">
          <div className="a-card">
            <Empty title="That post no longer exists">
              <p style={{ marginBottom: 14 }}>It may have been deleted.</p>
              <Link href="/admin/blog" className="a-btn">
                Back to the blog
              </Link>
            </Empty>
          </div>
        </div>
      </>
    );
  }

  return <PostForm post={post} />;
}
