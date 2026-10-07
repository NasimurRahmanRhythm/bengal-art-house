// Picked video → compressed in the browser → uploaded straight to Storage.
//
// Compression has to happen here, not on the server: a Vercel function takes a
// few megabytes per request, and a 45 MB video would never arrive. The browser
// does it with WebCodecs (through mediabunny), which uses the machine's own
// hardware encoder, so a minute of phone video re-encodes in seconds rather
// than minutes and there is no 30 MB ffmpeg download first.
//
// What comes out is an H.264/AAC MP4 at most 1920px on the long side, with
// the index at the front of the file so the player can start before the whole
// video has downloaded. Browsers built without the H.264 encoder (Chromium on
// Linux, some others) get VP9/Opus WebM instead, which every current browser
// also plays. The settings favour picture quality over the smallest possible
// file: the aim is to stop phone footage wasting storage, not to make it look
// worse.
//
// None of this is surfaced in the admin UI — to the person posting, it is
// simply "uploading".

import { createVideoUpload } from "./actions";

/** The admin panel's limit, matching the `videos` bucket. */
export const MAX_VIDEO_BYTES = 45 * 1024 * 1024;

/** Longest side of the stored video. 1080p: sharp on a laptop or a large
    phone even full screen, while 4K phone footage, which no reader's screen
    would show at full detail, is brought down to it. Smaller videos are
    never scaled up. */
const MAX_SIDE = 1920;

/** Video bitrate for 1080p at 30 fps — the level YouTube uses for its
    high-quality 1080p. Phones record at 15–50 Mbps; this keeps what a viewer
    can see and drops what they cannot. Scaled by pixel count for smaller
    videos and by 1.5× for 60 fps. Measured on grainy 1080p test footage at
    ~0.97 SSIM against the original. */
const BITRATE_1080P = 8_000_000;
const MIN_BITRATE = 1_500_000;
const AUDIO_BITRATE = 160_000;
/** Slow-motion phone clips (120/240 fps) are kept at 60, which is all a
    browser plays smoothly anyway. */
const MAX_FPS = 60;

/** Containers every browser plays as-is. Anything else (an iPhone .mov, an
    .mkv) must be re-encoded before it can be published. */
const PLAYABLE = new Set(["video/mp4", "video/webm"]);

export type PreparedVideo = {
  blob: Blob;
  type: "video/mp4" | "video/webm";
  /** False when the original was kept because it was already smaller. */
  compressed: boolean;
};

export const formatBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

/**
 * Re-encodes the video to H.264 MP4 (or VP9 WebM where H.264 is missing).
 *
 * Falls back to the original file only when it is already playable everywhere
 * (MP4/WebM) and either the browser cannot convert it or re-encoding would
 * not make it any smaller. A .mov that cannot be converted is refused rather
 * than published as a player that will not play in Chrome.
 */
export async function compressVideo(
  file: File,
  onProgress: (p: number) => void,
  signal?: AbortSignal,
): Promise<PreparedVideo> {
  const original = PLAYABLE.has(file.type)
    ? { blob: file as Blob, type: file.type as PreparedVideo["type"], compressed: false }
    : null;

  // Loaded on demand: the encoder is only needed on this one screen, and only
  // once someone actually picks a video.
  const mb = await import("mediabunny");

  const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS });
  const track = await input.getPrimaryVideoTrack().catch(() => null);
  if (!track) throw new Error("That file does not look like a video.");

  const landscape = track.displayWidth >= track.displayHeight;
  const longSide = landscape ? track.displayWidth : track.displayHeight;
  const scale = Math.min(1, MAX_SIDE / longSide);
  // Encoders want even dimensions.
  const even = (n: number) => Math.max(2, Math.round((n * scale) / 2) * 2);
  const width = even(track.displayWidth);
  const height = even(track.displayHeight);

  const stats = await track.computePacketStats(120).catch(() => null);
  const fps = stats?.averagePacketRate || 30;
  const bitrate = Math.max(
    MIN_BITRATE,
    Math.round(BITRATE_1080P * ((width * height) / (1920 * 1080)) * (fps > 40 ? 1.5 : 1)),
  );

  // Already lean (an export from an editor, a screen recording): nothing to
  // gain by re-encoding, and every re-encode costs a little detail.
  if (original && scale === 1 && stats && stats.averageBitrate > 0 && stats.averageBitrate <= bitrate * 1.1) {
    return original;
  }

  // H.264 in MP4 first: it plays everywhere, including older iPhones. Where
  // the browser has no H.264 encoder, VP9 in WebM.
  const mp4 = await mb.canEncodeVideo("avc", { width, height });
  const webm = !mp4 && (await mb.canEncodeVideo("vp9", { width, height }));
  if (!mp4 && !webm) {
    if (original) return original;
    throw new Error(
      "This video can't be uploaded from this browser. Use the latest Chrome, Edge or Safari, or choose an MP4.",
    );
  }
  const videoCodec = mp4 ? "avc" : "vp9";
  const type: PreparedVideo["type"] = mp4 ? "video/mp4" : "video/webm";
  // AAC is not available in every browser's encoder. Opus plays in every
  // current browser, in MP4 as well as WebM, so it is the fallback.
  const audioCodec = mp4 && (await mb.canEncodeAudio("aac")) ? "aac" : "opus";

  const target = new mb.BufferTarget();
  const output = new mb.Output({
    format: mp4 ? new mb.Mp4OutputFormat({ fastStart: "in-memory" }) : new mb.WebMOutputFormat(),
    target,
  });

  const conversion = await mb.Conversion.init({
    input,
    output,
    tracks: "primary",
    video: {
      width,
      height,
      fit: "contain",
      codec: videoCodec,
      quality: new mb.Quality({ bitrate, bitrateMode: "variable" }),
      ...(fps > MAX_FPS ? { frameRate: MAX_FPS } : {}),
      forceTranscode: true,
    },
    // Mono stays mono (half the audio bitrate); anything wider is folded to
    // stereo, which is all a laptop or phone speaker plays anyway.
    audio: (audioTrack) => ({
      codec: audioCodec,
      quality: new mb.Quality({ bitrate: AUDIO_BITRATE }),
      numberOfChannels: Math.min(2, audioTrack.numberOfChannels || 2),
    }),
    showWarnings: false,
  });

  if (!conversion.isValid) {
    if (original) return original;
    const undecodable = conversion.discardedTracks.some(
      (d) => d.track.isVideoTrack() && /source_codec/.test(d.reason),
    );
    throw new Error(
      undecodable
        ? "This video's format can't be read in this browser. Use Chrome, Edge or Safari, or save the video as an MP4 first."
        : "This video's format isn't supported. Try saving it as an MP4 first.",
    );
  }

  const abort = () => void conversion.cancel();
  signal?.addEventListener("abort", abort, { once: true });
  conversion.onProgress = (p) => onProgress(Math.min(1, p));

  try {
    await conversion.execute();
  } finally {
    signal?.removeEventListener("abort", abort);
  }

  if (!target.buffer) throw new Error("The video could not be prepared for upload. Please try again.");
  const blob = new Blob([target.buffer], { type });

  // A video that was already well compressed can come out larger. Keep
  // whichever is smaller, as long as the original will play everywhere.
  if (original && original.blob.size <= blob.size) return original;
  return { blob, type, compressed: true };
}

/**
 * Uploads the prepared video to the `videos` bucket and returns its public
 * URL. Uses XHR rather than fetch for one reason: upload progress, which a
 * 20 MB file on a slow connection badly needs.
 */
export async function uploadVideo(
  video: PreparedVideo,
  onProgress: (p: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (video.blob.size > MAX_VIDEO_BYTES) {
    throw new Error(`The video is too large (${formatBytes(video.blob.size)}). The limit is 45 MB.`);
  }

  const res = await createVideoUpload(video.type, video.blob.size);
  if (!res.ok) throw new Error(res.error);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", res.signedUrl);
    // The Supabase gateway wants the project's public key on every request;
    // the signed URL's token is what actually authorises the write.
    // Sent the way supabase-js sends it: as `apikey`, and also as a bearer
    // token when it is the older JWT-style anon key.
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    if (key) xhr.setRequestHeader("apikey", key);
    if (key.startsWith("eyJ")) xhr.setRequestHeader("authorization", `Bearer ${key}`);
    xhr.setRequestHeader("content-type", video.type);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `Upload failed (${xhr.status}).`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = body.message || body.error || message;
      } catch {
        // not JSON; keep the status line
      }
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("The upload was interrupted. Check the connection and try again."));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));

    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(video.blob);
  });

  return res.publicUrl;
}
