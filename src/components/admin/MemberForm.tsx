"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Topbar } from "./AdminShell";
import { ConfirmDelete, Field } from "./ui";
import ImageUpload from "./ImageUpload";
import { useAdmin } from "@/lib/admin/store";
import type { GoverningMember } from "@/lib/admin/types";

export default function MemberForm({ member }: { member?: GoverningMember }) {
  const router = useRouter();
  const { data, saveMember, deleteMember } = useAdmin();
  const isNew = !member;

  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [bio, setBio] = useState(member?.bio ?? "");
  const [photos, setPhotos] = useState<string[]>(member?.photos ?? []);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameError = !name.trim() ? "A name is required." : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (nameError || saving) return;
    setSaving(true);

    await saveMember({
      id: member?.id ?? "",
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      photos,
      // New members go to the end of the list; the order is then changed with
      // the arrows on the list screen rather than by typing a number here.
      orderIndex:
        member?.orderIndex ??
        data.governingBody.reduce((max, m) => Math.max(max, m.orderIndex), -1) + 1,
    });
    router.push("/admin/governing-body");
  }

  return (
    <>
      <Topbar
        title={isNew ? "Add member" : name || "Unnamed"}
        parent={{ href: "/admin/governing-body", label: "Governing Body" }}
        actions={
          !isNew && (
            <ConfirmDelete
              size="md"
              label="Remove member"
              onConfirm={async () => {
                await deleteMember(member.id);
                router.push("/admin/governing-body");
              }}
            />
          )
        }
      />

      <div className="a-body">
        <form className="a-form" onSubmit={submit} noValidate>
          <section className="a-section">
            <div className="a-grid">
              <Field label="Name" error={touched ? nameError : ""}>
                <input
                  className="a-input"
                  value={name}
                  autoFocus
                  aria-invalid={touched && !!nameError}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ivy Zaman"
                />
              </Field>

              <Field label="Position" optional hint="Shown under the name.">
                <input
                  className="a-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Chairperson"
                />
              </Field>

              <Field label="Picture" optional>
                <ImageUpload photos={photos} onChange={setPhotos} max={1} />
              </Field>

              <Field label="About" optional hint="A short paragraph.">
                <textarea
                  className="a-textarea"
                  style={{ minHeight: 140 }}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Sculptor and trustee, overseeing the gallery's collection since 2019."
                />
              </Field>
            </div>
          </section>

          <div className="a-formBar">
            <span className="a-hint">{isNew ? "Not saved yet" : "Editing an existing member"}</span>
            <Link href="/admin/governing-body" className="a-btn">
              Cancel
            </Link>
            <button type="submit" className="a-btn" data-variant="primary" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Add member" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
