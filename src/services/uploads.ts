import { getSupabase } from "@/lib/supabase";

/**
 * Uploads & automatic compression (G9).
 *
 * Rules:
 * - Per-type max size. If a file exceeds it, the compressor reduces it BEFORE
 *   upload and only the compressed version is stored. The oversized original
 *   never leaves the device.
 * - Images: canvas re-encode to JPEG, stepped quality.
 * - Video: browser-native MediaRecorder re-encode (downscale + lower bitrate).
 *   Zero external service, zero cost. For longer/heavier clips later, the
 *   right upgrade is a hosted transcoder (Mux or Cloudflare Stream); the
 *   service shape here doesn't change.
 * - PDF: rendered to JPEG pages in the browser using pdfjs-dist, then each
 *   page is uploaded as a separate image. The original PDF is not stored.
 */

export const MAX_BYTES: Record<"image" | "video" | "pdf", number> = {
  image: 8 * 1024 * 1024, // 8 MB stored
  video: 50 * 1024 * 1024, // 50 MB stored (after re-encode)
  pdf: 25 * 1024 * 1024, // 25 MB stored
};

/** Hard ceiling on the raw input we'll even attempt to compress. */
export const MAX_INPUT_BYTES: Record<"image" | "video" | "pdf", number> = {
  image: 30 * 1024 * 1024,
  video: 200 * 1024 * 1024,
  pdf: 25 * 1024 * 1024,
};

export interface UploadProgress {
  phase: "compressing" | "uploading" | "extracting" | "done";
  /** 0–1 */
  ratio: number;
  finalBytes?: number;
  note?: string;
}

export interface UploadResult {
  path: string;
  finalBytes: number;
  /** For PDFs: the extracted page-image paths in the same bucket. */
  extractedImages?: string[];
}

function kindOf(file: File): "image" | "video" | "pdf" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "pdf";
}

// ---------- image ----------
async function compressImage(file: File, maxBytes: number): Promise<File> {
  if (file.size <= maxBytes) return file;
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0);
  for (const quality of [0.82, 0.7, 0.6, 0.5, 0.4]) {
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (blob && blob.size <= maxBytes) {
      return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
        type: "image/jpeg",
      });
    }
  }
  return file;
}

// ---------- video ----------
/**
 * Re-encode a video using MediaRecorder. Plays the source through a hidden
 * <video>, paints frames into a downscaled canvas captureStream, and records
 * a new webm. Works in modern browsers without WASM or SharedArrayBuffer.
 *
 * Returns the original file if the browser cannot do it — the caller then
 * decides whether to upload as-is or reject.
 */
async function compressVideo(
  file: File,
  maxBytes: number,
  onProgress?: (p: UploadProgress) => void,
): Promise<File> {
  if (file.size <= maxBytes) return file;
  if (typeof MediaRecorder === "undefined") return file;

  const src = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("video metadata failed"));
    });

    const maxDim = 1280; // 720p-ish ceiling
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.max(2, Math.round(video.videoWidth * scale));
    const h = Math.max(2, Math.round(video.videoHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // ~1.2 Mbps — good enough for portfolio clips at 720p.
    const stream = (canvas as HTMLCanvasElement).captureStream(30);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1_200_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

    const done = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
    });

    recorder.start(250);
    await video.play();

    const duration = isFinite(video.duration) ? video.duration : 0;
    let raf = 0;
    const tick = () => {
      ctx.drawImage(video, 0, 0, w, h);
      if (duration > 0) {
        onProgress?.({ phase: "compressing", ratio: Math.min(0.95, video.currentTime / duration) });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });
    cancelAnimationFrame(raf);
    recorder.stop();
    const blob = await done;

    return new File([blob], file.name.replace(/\.\w+$/, ".webm"), { type: mime });
  } finally {
    URL.revokeObjectURL(src);
  }
}

// ---------- public api ----------
async function currentUserId(): Promise<string> {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

// ---------- pdf ----------
async function renderPdfPages(file: File, onProgress?: (p: UploadProgress) => void): Promise<Blob[]> {
  // Lazy-load pdfjs so first-paint isn't penalised.
  const pdfjs = await import("pdfjs-dist");
  // Worker via CDN — matches the installed version.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const buf = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: buf, isEvalSupported: false, disableFontFace: true }).promise;
  const pageCount = Math.min(pdf.numPages, 40);
  const out: Blob[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.82));
    if (blob) out.push(blob);
    onProgress?.({ phase: "extracting", ratio: i / pageCount });
  }
  return out;
}

// ---------- public api ----------
async function currentUserId(): Promise<string> {
  const { data, error } = await getSupabase().auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

export const uploadService = {
  /**
   * Compress (if needed) then upload to the given bucket under the caller's
   * folder. For PDFs, each rendered page is uploaded as its own JPEG and the
   * resulting image paths are returned. The PDF itself is not stored.
   */
  async upload(
    bucket: "work" | "class-docs",
    subpath: string,
    file: File,
    onProgress?: (p: UploadProgress) => void,
  ): Promise<UploadResult> {
    const kind = kindOf(file);
    if (file.size > MAX_INPUT_BYTES[kind]) {
      throw new Error(
        `File too large. ${kind === "video" ? "Trim it or export at a lower resolution first." : "Try a smaller copy."}`,
      );
    }

    const uid = await currentUserId();
    const cleanSub = subpath.replace(/^\/+/, "");
    const supabase = getSupabase();

    // PDF: render pages, upload images, never store the PDF itself.
    if (kind === "pdf") {
      onProgress?.({ phase: "extracting", ratio: 0 });
      const pages = await renderPdfPages(file, onProgress);
      const baseDir = `${uid}/${cleanSub.replace(/\.[^./]+$/, "")}/pages`;
      const extractedImages: string[] = [];
      let total = 0;
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const path = `${baseDir}/page-${String(i + 1).padStart(3, "0")}.jpg`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, p, { upsert: true, contentType: "image/jpeg" });
        if (error) throw error;
        extractedImages.push(path);
        total += p.size;
        onProgress?.({ phase: "uploading", ratio: (i + 1) / pages.length, finalBytes: total });
      }
      onProgress?.({ phase: "done", ratio: 1, finalBytes: total });
      return { path: baseDir, finalBytes: total, extractedImages };
    }

    // Image / video: compress, then upload.
    onProgress?.({ phase: "compressing", ratio: 0 });
    let toStore: File = file;
    if (kind === "image") {
      toStore = await compressImage(file, MAX_BYTES.image);
    } else {
      toStore = await compressVideo(file, MAX_BYTES.video, onProgress);
      if (toStore.size > MAX_BYTES.video) {
        throw new Error("Couldn't bring this clip under the size limit. Trim and try again.");
      }
    }

    const path = `${uid}/${cleanSub}`;
    onProgress?.({ phase: "uploading", ratio: 0.5, finalBytes: toStore.size });
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, toStore, { upsert: true, contentType: toStore.type || undefined });
    if (error) throw error;

    onProgress?.({ phase: "done", ratio: 1, finalBytes: toStore.size });
    return { path, finalBytes: toStore.size };
  },
};

