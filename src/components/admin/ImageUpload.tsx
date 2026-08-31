"use client";

import { useRef, useState } from "react";
import { CloseIcon, PlusIcon } from "./Icons";
import { storeImage } from "@/lib/admin/image";

/* A row of picture tiles. Each filled tile shows the photograph it holds; the
   last tile is always empty, dashed, with a plus in the middle — click it and
   the file picker opens. That empty tile is the only instruction the screen
   needs, so there is no drop zone, no paste handler and no URL box. */

export default function ImageUpload({
  photos,
  onChange,
  max = 8,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");

    const room = max - photos.length;
    const added: string[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        added.push(await storeImage(file));
      } catch (e) {
        setError(e instanceof Error ? e.message : "That picture could not be added.");
      }
    }

    if (added.length) onChange([...photos, ...added]);
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="a-uploads">
      <div className="a-tiles">
        {photos.map((src, i) => (
          <div className="a-tile" key={i} data-filled>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Picture ${i + 1}`} className="a-tileImg" />
            <button
              type="button"
              className="a-tileRemove"
              onClick={() => onChange(photos.filter((_, j) => j !== i))}
              aria-label={`Remove picture ${i + 1}`}
            >
              <CloseIcon size={13} />
            </button>
            {i === 0 && photos.length > 1 && <span className="a-tileFlag">Main</span>}
          </div>
        ))}

        {photos.length < max && (
          <button
            type="button"
            className="a-tile"
            data-add
            disabled={busy}
            onClick={() => input.current?.click()}
            aria-label="Add a picture"
          >
            <span className="a-tilePlus">
              <PlusIcon size={20} />
            </span>
            <span className="a-tileHint">{busy ? "Adding…" : "Add picture"}</span>
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => pick(e.target.files)}
      />

      {error && <span className="a-error">{error}</span>}
    </div>
  );
}
