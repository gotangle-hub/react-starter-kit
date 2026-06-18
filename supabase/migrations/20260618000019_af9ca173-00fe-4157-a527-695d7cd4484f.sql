
-- Notifications table for in-app notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  target_kind text,
  target_id text,
  body text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx ON public.notifications (user_id) WHERE read_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications read own" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "notifications update own" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications delete own" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- No INSERT policy: only triggers (SECURITY DEFINER) and service_role can insert.

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Trigger: notify post author on like/save/pin/comment
CREATE OR REPLACE FUNCTION public.notify_on_interaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author uuid;
  v_body text;
BEGIN
  IF NEW.target_kind <> 'post' THEN RETURN NEW; END IF;
  IF NEW.kind NOT IN ('like','save','pin','comment') THEN RETURN NEW; END IF;

  BEGIN
    SELECT author_id INTO v_author FROM public.posts WHERE id::text = NEW.target_id;
  EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
  END;

  IF v_author IS NULL OR v_author = NEW.user_id THEN RETURN NEW; END IF;

  v_body := CASE NEW.kind
    WHEN 'like' THEN 'liked your work'
    WHEN 'save' THEN 'saved your work'
    WHEN 'pin' THEN 'pinned your work'
    WHEN 'comment' THEN 'commented on your work'
  END;

  INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
  VALUES (v_author, NEW.kind, NEW.user_id, 'post', NEW.target_id, v_body);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_interaction
AFTER INSERT ON public.interactions
FOR EACH ROW EXECUTE FUNCTION public.notify_on_interaction();

-- Trigger: notify on new follower
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.followee_id = NEW.follower_id THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
  VALUES (NEW.followee_id, 'follow', NEW.follower_id, 'user', NEW.follower_id::text, 'started following you');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_follow
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();
