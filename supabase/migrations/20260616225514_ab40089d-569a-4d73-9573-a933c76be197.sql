
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.search_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('post','maker')),
  ref_id text NOT NULL,
  content text NOT NULL,
  image_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, ref_id)
);
CREATE INDEX IF NOT EXISTS search_documents_kind_idx ON public.search_documents(kind);

GRANT SELECT ON public.search_documents TO anon, authenticated;
GRANT ALL ON public.search_documents TO service_role;
ALTER TABLE public.search_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_documents public read" ON public.search_documents FOR SELECT USING (true);

-- Cosine-distance match function. Returns ref_id + similarity for the caller's chosen kind.
CREATE OR REPLACE FUNCTION public.match_search_documents(
  query_embedding vector(1536),
  match_kind text,
  match_count int DEFAULT 24
)
RETURNS TABLE (
  ref_id text,
  content text,
  metadata jsonb,
  similarity real
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT d.ref_id, d.content, d.metadata,
         (1 - (d.embedding <=> query_embedding))::real AS similarity
  FROM search_documents d
  WHERE d.kind = match_kind
    AND d.embedding IS NOT NULL
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_search_documents(vector, text, int) TO anon, authenticated;
