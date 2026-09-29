"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import styles from "./account.module.css";

type Props = {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  memberSince: string;
};

const initialsOf = (name: string, email: string): string => {
  const source = name.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** The customer's own details, editable in place.
 *
 *  Name and phone are normally filled in by checkout — the gallery learns them
 *  the first time somebody buys. This form exists for the case checkout cannot
 *  cover: a number that has changed since the last order. */
export default function ProfileCard({ userId, email, fullName, phone, memberSince }: Props) {
  const router = useRouter();
  const { signOut } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(fullName);
  const [tel, setTel] = useState(phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("A name is required.");
    if (tel.trim() && tel.replace(/\D/g, "").length < 11) {
      return setError("Enter a full phone number, including the leading 0.");
    }

    setSaving(true);

    const { error: saveError } = await supabase
      .from("profiles")
      .update({ full_name: name.trim(), phone: tel.trim() || null })
      .eq("id", userId);

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setEditing(false);
    router.refresh();
  };

  return (
    <aside className={`${styles.panel} ${styles.sticky}`}>
      <div className={styles.panelHead}>
        <span>Your details</span>
        {!editing && (
          <button type="button" className={styles.editBtn} onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form className={styles.form} onSubmit={onSave}>
          <label className={styles.field}>
            <span>Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={saving}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Phone</span>
            <input
              type="tel"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="01XXXXXXXXX"
              disabled={saving}
            />
          </label>

          <p className={styles.formNote}>
            Your email is the address you sign in with and cannot be changed here.
          </p>

          {error && (
            <p className={styles.formError} role="alert">
              {error}
            </p>
          )}

          <div className={styles.formActions}>
            <button type="submit" className={styles.save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => {
                setName(fullName);
                setTel(phone);
                setError(null);
                setEditing(false);
              }}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <span className={styles.avatar} aria-hidden="true">
            {initialsOf(fullName, email)}
          </span>

          <div className={styles.detail}>
            <span className={styles.detailLabel}>Name</span>
            <span className={styles.detailValue}>
              {fullName || <em className={styles.detailEmpty}>Added at your first order</em>}
            </span>
          </div>

          <div className={styles.detail}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{email}</span>
          </div>

          <div className={styles.detail}>
            <span className={styles.detailLabel}>Phone</span>
            <span className={styles.detailValue}>
              {phone || <em className={styles.detailEmpty}>Added at your first order</em>}
            </span>
          </div>

          <div className={styles.detail}>
            <span className={styles.detailLabel}>Member since</span>
            <span className={styles.detailValue}>{memberSince}</span>
          </div>

          <div className={styles.formActions} style={{ marginTop: 20 }}>
            <button
              type="button"
              className={styles.cancel}
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
