// G4 · Semantic search edge function.
// Embeds the user's query (text or image) using the Lovable AI gateway and
// returns the closest matches from public.search_documents via the
// `match_search_documents` RPC. Same multimodal model is used for indexing
// and querying so text and image queries land in the same vector space —
// that is what makes "chair" return chair-like photos even when no caption
// uses the word.
//
// IMPORTANT: never name the powering technology in any response field that
// the UI could render — G4 rule. Only return matches + similarity numbers.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const EMBED_URL = "https://ai.gateway.lovable.dev/v1/embeddings";
const EMBED_MODEL = "google/gemini-embedding-2";
const EMBED_DIMS = 1536;

interface Body {
  mode: "text" | "people" | "image";
  query?: string;
  image_data_url?: string;
  limit?: number;
}

async function embed(input: unknown): Promise<number[]> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(EMBED_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({ model: EMBED_MODEL, dimensions: EMBED_DIMS, input }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`embed ${res.status}: ${t}`);
  }
  const data = await res.json();
  const v = data?.data?.[0]?.embedding;
  if (!Array.isArray(v)) throw new Error("no embedding in response");
  return v;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.mode) {
      return new Response(JSON.stringify({ error: "mode required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build embedding input. Multimodal input for image mode, plain text otherwise.
    let embedInput: unknown;
    if (body.mode === "image") {
      if (!body.image_data_url) {
        return new Response(JSON.stringify({ error: "image_data_url required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Cap image payload at ~2MB of base64 to prevent abuse of the embedding API.
      const MAX_IMAGE_CHARS = 2_800_000; // ~2MB after base64 decoding
      if (typeof body.image_data_url !== "string" || body.image_data_url.length > MAX_IMAGE_CHARS) {
        return new Response(JSON.stringify({ error: "image too large" }), {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      embedInput = [{
        content: [{ type: "image_url", image_url: { url: body.image_data_url } }],
      }];
    } else {
      const q = (body.query ?? "").trim();
      if (!q) {
        return new Response(JSON.stringify({ error: "query required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      embedInput = q;
    }

    const vec = await embed(embedInput);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const kind = body.mode === "people" ? "maker" : "post";
    const { data, error } = await admin.rpc("match_search_documents", {
      query_embedding: vec as unknown as string,
      match_kind: kind,
      match_count: Math.min(Math.max(body.limit ?? 24, 1), 60),
    });
    if (error) throw error;

    return new Response(JSON.stringify({ matches: data ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
