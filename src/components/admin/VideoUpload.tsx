"use client";

import { useEffect, useRef, useState } from "react";
import { compressVideo, formatBytes, MAX_VIDEO_BYTES, uploadVideo } from "@/lib/admin/video";

/** Share of the single progress bar given to preparing the file; the rest is
    the network upload. Roughly how the two compare in time for a phone video. */
const PREPARE_SHARE = 0.6;

/**
 * The blog post's optional video.
 *
 * Picking a file prepares it (see lib/admin/video.ts — it is re-encoded to
 * save storage) and uploads it straight away, so by the time the post is
 * saved the only thing left to store is the URL. To the person posting it is
 * one step, "Uploading", with one progress bar: the re-encoding is an
 * implementation detail and is never mentioned on screen.
 * `onBusy` lets the form hold its Save buttons while that is happening — a
 * post saved mid-upload would be saved without its video.
 */
export default function VideoUpload({
  value,
  onChange,
  onBusy,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** 0–1 across preparing and uploading together; null when idle. */
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  // Leaving the page mid-upload should not keep the encoder running.
  useEffect(() => () => abortRef.current?.abort(), []);

  const busy = progress !== null;

  async function pick(file: File) {
    setError("");
    setResult("");

    if (!file.type.startsWith("video/") && !/\.(mp4|mov|m4v|webm|mkv)$/i.test(file.name)) {
      setError("That file is not a video.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(`That video is ${formatBytes(file.size)}. Please choose one under 45 MB.`);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    onBusy?.(true);

    try {
      setProgress(0);
      const prepared = await compressVideo(
        file,
        (p) => setProgress(p * PREPARE_SHARE),
        controller.signal,
      );

      const url = await uploadVideo(
        prepared,
        (p) => setProgress(PREPARE_SHARE + p * (1 - PREPARE_SHARE)),
        controller.signal,
      );

      onChange(url);
      setResult("Video uploaded.");
    } catch (e) {
      const cancelled =
        controller.signal.aborted || (e instanceof Error && /cancel|abort/i.test(e.name + e.message));
      setError(cancelled ? "" : e instanceof Error ? e.message : "The video could not be uploaded.");
    } finally {
      abortRef.current = null;
      setProgress(null);
      onBusy?.(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const percent = Math.round((progress ?? 0) * 100);

  return (
    <div className="a-video">
      {value && !busy && (
        <div className="a-videoPreview">
          {/* Previewed from the bucket, exactly as readers will get it. */}
          <video src={value} controls preload="metadata" playsInline />
        </div>
      )}

      {busy ? (
        <div className="a-videoProgress" role="status" aria-live="polite">
          <div className="a-videoProgressHead">
            <span>Uploading video…</span>
            <span className="a-num">{percent}%</span>
          </div>
          <div className="a-videoBar">
            <span style={{ width: `${percent}%` }} />
          </div>
          <button
            type="button"
            className="a-btn"
            data-size="sm"
            onClick={() => abortRef.current?.abort()}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="a-videoActions">
          <button type="button" className="a-btn" data-size="sm" onClick={() => fileRef.current?.click()}>
            {value ? "Replace video" : "Choose a video"}
          </button>
          {value && (
            <button
              type="button"
              className="a-btn"
              data-size="sm"
              data-variant="danger"
              onClick={() => {
                onChange(null);
                setResult("");
              }}
            >
              Remove video
            </button>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-m4v,video/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) pick(file);
        }}
      />

      {error && <span className="a-error">{error}</span>}
      {!error && result && <span className="a-hint">{result}</span>}
      {!error && !result && !busy && (
        <span className="a-hint">MP4, MOV or WebM, up to 45 MB.</span>
      )}
    </div>
  );
}
