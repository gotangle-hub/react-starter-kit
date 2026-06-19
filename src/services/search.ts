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
  return data.matches as SearchMatch[];
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}
