// G4 · One-shot seeder for the semantic search index.
// Embeds the current catalog (fixture posts + makers, plus richer "chair"
// reference items so visual-search for furniture has corpus) and upserts them
// into public.search_documents. Idempotent — safe to call repeatedly.
// Hits the SAME embedding model as the live `search` function so query and
// index vectors are comparable.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const EMBED_URL = "https://ai.gateway.lovable.dev/v1/embeddings";
const EMBED_MODEL = "google/gemini-embedding-2";
const EMBED_DIMS = 1536;

interface Doc {
  kind: "post" | "maker";
  ref_id: string;
  content: string;
  image_url?: string;
  metadata?: Record<string, unknown>;
}

// Mirror of src/lib/fixtures.ts at indexing time. Kept in this function on
// purpose so the index can be rebuilt without shipping fixture imports into
// the edge runtime.
const DOCS: Doc[] = [
  // Posts (real feed items)
  { kind: "post", ref_id: "e1", content: "A house that listens. Architecture project. Adaptive reuse, concrete, warm light, residential. Dubai. By Lina Kassem.", metadata: { title: "A house that listens", cat: "Architecture", maker: "lina", img: "spec-full.jpg" } },
  { kind: "post", ref_id: "e2", content: "Tools, documented. Industrial product design — steel shears, blades, edge detail, tooling, craft. Dubai. By Arian Saghafifar.", metadata: { title: "Tools, documented", cat: "Product", maker: "arian", img: "spec-blades.jpg" } },
  { kind: "post", ref_id: "e3", content: "One line, drawn blue. Type and lettering, wordmark study, editorial, brand identity. Abu Dhabi. By Mona Rao.", metadata: { title: "One line, drawn blue", cat: "Type", maker: "mona", img: "spec-negative.jpg" } },
  { kind: "post", ref_id: "e4", content: "Thrown, trimmed, dried. Ceramics, tableware, handmade vessels, clay. Lisbon. By Yuki Tan.", metadata: { title: "Thrown, trimmed, dried", cat: "Ceramics", maker: "yuki", img: "spec-handles.jpg" } },

  // Visual-search corpus for furniture / chairs (so "chair" returns chair-like results)
  { kind: "post", ref_id: "vs1",  content: "Bent ply lounge chair, curved laminated plywood, mid-century furniture.", metadata: { title: "Bent ply lounge", cat: "Furniture", maker: "studio", img: "spec-full.jpg" } },
  { kind: "post", ref_id: "vs2",  content: "Steel stool, welded frame, industrial seating, raw metal.", metadata: { title: "Steel stool, welded", cat: "Furniture", maker: "arian", swatch: "#161514" } },
  { kind: "post", ref_id: "vs3",  content: "Rope seat study, woven seating, natural fibre chair.", metadata: { title: "Rope seat study", cat: "Furniture", maker: "noor", swatch: "#A85C3A" } },
  { kind: "post", ref_id: "vs4",  content: "Oak dining chair, solid timber, joinery, residential furniture.", metadata: { title: "Oak dining chair", cat: "Furniture", maker: "lina", img: "spec-handles.jpg" } },
  { kind: "post", ref_id: "vs5",  content: "Cast aluminium chair, sand-cast metal seating.", metadata: { title: "Cast aluminium", cat: "Furniture", maker: "studio", swatch: "#6E665B" } },
  { kind: "post", ref_id: "vs6",  content: "Woven back chair, cane backrest, traditional craft furniture.", metadata: { title: "Woven back", cat: "Furniture", maker: "noor", swatch: "#3A5A40" } },
  { kind: "post", ref_id: "vs7",  content: "Stacking chair, industrial design, contract seating.", metadata: { title: "Stacking chair", cat: "Furniture", maker: "arian", img: "spec-blades.jpg" } },
  { kind: "post", ref_id: "vs8",  content: "Cantilever frame chair, tubular steel, Bauhaus reference.", metadata: { title: "Cantilever frame", cat: "Furniture", maker: "studio", swatch: "#0107FF" } },
  { kind: "post", ref_id: "vs9",  content: "Studio armchair, upholstered lounge seating, residential design.", metadata: { title: "Studio armchair", cat: "Furniture", maker: "lina", img: "spec-full.jpg" } },
  { kind: "post", ref_id: "vs10", content: "Foam prototype chair, design process, mock-up seating.", metadata: { title: "Foam prototype", cat: "Furniture", maker: "arian", swatch: "#A85C3A" } },
  { kind: "post", ref_id: "vs11", content: "Three leg stool, minimal wood seating.", metadata: { title: "Three leg stool", cat: "Furniture", maker: "yuki", swatch: "#161514" } },
  { kind: "post", ref_id: "vs12", content: "Folding chair, portable seating, hinged frame.", metadata: { title: "Folding chair", cat: "Furniture", maker: "studio", swatch: "#6B4EFF" } },

  // Makers (people search)
  { kind: "maker", ref_id: "lina",   content: "Lina Kassem. Architecture. Adaptive reuse, concrete, residential, public space. Beirut.", metadata: { role: "Architecture", city: "Beirut" } },
  { kind: "maker", ref_id: "arian",  content: "Arian Saghafifar. Industrial design. Product, furniture, steel, tooling, manufacturing. Dubai.", metadata: { role: "Industrial design", city: "Dubai" } },
  { kind: "maker", ref_id: "mona",   content: "Mona Rao. Brand and type. Wordmarks, editorial, typography, identity systems. Abu Dhabi.", metadata: { role: "Brand & type", city: "Abu Dhabi" } },
  { kind: "maker", ref_id: "yuki",   content: "Yuki Tan. Ceramics. Tableware, glaze, hand-thrown vessels. Lisbon.", metadata: { role: "Ceramics", city: "Lisbon" } },
  { kind: "maker", ref_id: "noor",   content: "Noor Haddad. Textiles. Natural dye, weaving, soft materials. Amman.", metadata: { role: "Textiles", city: "Amman" } },
  { kind: "maker", ref_id: "studio", content: "Atelier Travertine. Studio of six. Architecture, interiors, exhibition design, furniture. Dubai.", metadata: { role: "Studio · 6 people", city: "Dubai" } },
];

async function embedBatch(inputs: string[]): Promise<number[][]> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const res = await fetch(EMBED_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({ model: EMBED_MODEL, dimensions: EMBED_DIMS, input: inputs }),
  });
  if (!res.ok) throw new Error(`embed ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data?.data ?? []).map((d: { embedding: number[] }) => d.embedding);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Embed in small batches to stay within per-request input caps.
    const BATCH = 8;
    let inserted = 0;
    for (let i = 0; i < DOCS.length; i += BATCH) {
      const slice = DOCS.slice(i, i + BATCH);
      const vectors = await embedBatch(slice.map((d) => d.content));
      const rows = slice.map((d, j) => ({
        kind: d.kind,
        ref_id: d.ref_id,
        content: d.content,
        image_url: d.image_url ?? null,
        metadata: d.metadata ?? {},
        embedding: vectors[j] as unknown as string,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await admin
        .from("search_documents")
        .upsert(rows, { onConflict: "kind,ref_id" });
      if (error) throw error;
      inserted += rows.length;
    }

    return new Response(JSON.stringify({ ok: true, indexed: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
