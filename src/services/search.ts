// G4 · Client wrapper around the `search` edge function.
// Returns ordered match objects. Never surfaces the powering technology to
// the UI — only the matches.
import { supabase } from "@/integrations/supabase/client";
import { getBlockedIds } from "@/services/blocks";

export type SearchMode = "text" | "people" | "image";
export interface SearchMatch {
  ref_id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function semanticSearch(args: {
  mode: SearchMode;
  query?: string;
  image_data_url?: string;
  limit?: number;
}): Promise<SearchMatch[]> {
  const { data, error } = await supabase.functions.invoke("search", { body: args });
  if (error || !data?.matches) return [];
  const matches = data.matches as SearchMatch[];
  // G-blocks: hide results authored by — or representing — a blocked user.
  const blocked = await getBlockedIds();
  if (!blocked.size) return matches;
  return matches.filter((m) => {
    const meta = (m.metadata ?? {}) as Record<string, unknown>;
    const author = (meta.author_id ?? meta.user_id ?? null) as string | null;
    if (args.mode === "people") return !blocked.has(m.ref_id);
    return !author || !blocked.has(author);
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}
