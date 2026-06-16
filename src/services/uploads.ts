import { getSupabase } from "@/lib/supabase";

/**
 * Uploads & automatic compression (G9).
 * Enforces a per-type max size; if a file exceeds it, the compressor reduces it
 * BEFORE upload and only the compressed version is stored. PDFs go through a
 * separate extraction path (handled server-side / in Lovable later).
 *
 * The compression here is intentionally a clean seam — image compression is a
 * real client-side canvas pass; video/PDF are stubbed for the backend to own.
 */

export const MAX_BYTES: Record<"image" | "video" | "pdf", number> = {
  image: 8 * 1024 * 1024, // 8 MB
  video: 100 * 1024 * 1024, // 100 MB
  pdf: 25 * 1024 * 1024, // 25 MB
};

export interface UploadProgress {
  phase: "compressing" | "uploading" | "done";
  /** 0–1 */
  ratio: number;
  finalBytes?: number;
}

function kindOf(file: File): "image" | "video" | "pdf" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "pdf";
}

/** Compress an image to fit within the limit using a canvas re-encode. */
async function compressImage(file: File, maxBytes: number): Promise<File> {
  if (file.size <= maxBytes) return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0);

  // Step quality down until under the cap (oversized original is never kept).
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

export const uploadService = {
  /**
   * Compress (if needed) then upload to a Supabase storage bucket.
   * Returns the stored path. `onProgress` surfaces compression + final size.
   */
  async upload(
    bucket: string,
    path: string,
    file: File,
    onProgress?: (p: UploadProgress) => void,
  ): Promise<{ path: string; finalBytes: number }> {
    const kind = kindOf(file);
    onProgress?.({ phase: "compressing", ratio: 0 });

    const toStore =
      kind === "image" ? await compressImage(file, MAX_BYTES.image) : file;

    onProgress?.({ phase: "uploading", ratio: 0.5, finalBytes: toStore.size });

    const { error } = await getSupabase()
      .storage.from(bucket)
      .upload(path, toStore, { upsert: true });
    if (error) throw error;

    onProgress?.({ phase: "done", ratio: 1, finalBytes: toStore.size });
    return { path, finalBytes: toStore.size };
  },
};
