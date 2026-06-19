
-- 1. boards
CREATE TABLE IF NOT EXISTS public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  cover_path text,
  is_private boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS boards_owner_idx ON public.boards(owner_id);
CREATE INDEX IF NOT EXISTS boards_public_idx ON public.boards(is_private) WHERE is_private = false;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.boards TO authenticated;
GRANT ALL ON public.boards TO service_role;

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access to boards"
  ON public.boards FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Public boards are readable"
  ON public.boards FOR SELECT
  TO authenticated
  USING (is_private = false);

-- 2. board_items
CREATE TABLE IF NOT EXISTS public.board_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (board_id, post_id)
);
CREATE INDEX IF NOT EXISTS board_items_board_idx ON public.board_items(board_id, added_at DESC);
CREATE INDEX IF NOT EXISTS board_items_post_idx ON public.board_items(post_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_items TO authenticated;
GRANT ALL ON public.board_items TO service_role;

ALTER TABLE public.board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access to board items"
  ON public.board_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = board_items.board_id AND b.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = board_items.board_id AND b.owner_id = auth.uid()
  ));

CREATE POLICY "Public board items are readable"
  ON public.board_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.boards b
    WHERE b.id = board_items.board_id AND b.is_private = false
  ));
