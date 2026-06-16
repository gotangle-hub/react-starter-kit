// G9 · PDF → images extractor.
// Receives a PDF stored in the `work` bucket under the caller's folder, renders
// every page to a JPEG, uploads them next to the PDF and returns the list of
// resulting object paths. The original PDF is left in place; the client can
// delete it after a successful response if they only want the images.
//
// Auth: caller must be signed in. We validate the JWT in-code, then re-create
// a client with the user's token so storage RLS applies. The PDF must already
// live under <user.id>/...
//
// Cost: $0 (runs inside the edge function on Lovable Cloud).

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
// pdfjs-dist legacy build works in Deno without a DOM.
import * as pdfjsLib from "npm:pdfjs-dist@4.7.76/legacy/build/pdf.mjs";
// Canvas polyfill for Deno — pdfjs needs a CanvasRenderingContext2D.
import { createCanvas } from "npm:@napi-rs/canvas@0.1.56";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  /** Path of the PDF inside the `work` bucket, e.g. "<uid>/raw/file.pdf". */
  pdf_path: z.string().min(1).max(1024),
  /** Render scale — 1.5 ≈ 144dpi, a good middle ground. */
  scale: z.number().min(0.5).max(3).optional(),
  /** JPEG quality 0–1. */
  quality: z.number().min(0.3).max(0.95).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub as string;

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const { pdf_path, scale = 1.5, quality = 0.82 } = parsed.data;

  // Path must be inside the caller's folder.
  if (!pdf_path.startsWith(`${userId}/`)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Download the PDF (RLS enforced via the user's token).
  const { data: pdfBlob, error: dlErr } = await supabase.storage
    .from("work")
    .download(pdf_path);
  if (dlErr || !pdfBlob) {
    return new Response(JSON.stringify({ error: "PDF not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const pdfBytes = new Uint8Array(await pdfBlob.arrayBuffer());

  // Load with pdfjs.
  const loadingTask = pdfjsLib.getDocument({
    data: pdfBytes,
    isEvalSupported: false,
    disableFontFace: true,
  });
  const pdf = await loadingTask.promise;

  // Where to put the page images.
  const dir = pdf_path.replace(/\.[^./]+$/, "") + "/pages";
  const uploaded: { page: number; path: string; bytes: number }[] = [];

  // Cap pages to a sensible number — large books shouldn't ddos the function.
  const pageCount = Math.min(pdf.numPages, 40);

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d");
    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;

    const jpegBuf = await canvas.encode("jpeg", Math.round(quality * 100));
    const outPath = `${dir}/page-${String(pageNum).padStart(3, "0")}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("work")
      .upload(outPath, jpegBuf, { contentType: "image/jpeg", upsert: true });
    if (upErr) {
      return new Response(
        JSON.stringify({ error: `Upload failed on page ${pageNum}: ${upErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    uploaded.push({ page: pageNum, path: outPath, bytes: jpegBuf.byteLength });
  }

  return new Response(
    JSON.stringify({
      pdf_path,
      page_count: pageCount,
      truncated: pdf.numPages > pageCount,
      images: uploaded,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
