
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(btrim(body)) > 0 AND length(body) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comments_post_idx ON public.comments(post_id, created_at);
CREATE INDEX comments_author_idx ON public.comments(author_id);

GRANT SELECT, INSERT, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments readable by signed-in users"
  ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- Notify post author on new comment (skip self-comments).
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_author uuid;
BEGIN
  SELECT author_id INTO v_author FROM public.posts WHERE id = NEW.post_id;
  IF v_author IS NULL OR v_author = NEW.author_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
  VALUES (v_author, 'comment', NEW.author_id, 'post', NEW.post_id::text, 'commented on your work');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER comments_notify_author
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
