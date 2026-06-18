
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS avatar_path text,
  ADD COLUMN IF NOT EXISTS banner_path text;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS media_paths text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS on_explore boolean NOT NULL DEFAULT true;

-- Allow anyone to read media in the `work` bucket so posts render in feeds.
-- Writes stay owner-only via the existing policies.
DROP POLICY IF EXISTS "work public read" ON storage.objects;
CREATE POLICY "work public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'work');
