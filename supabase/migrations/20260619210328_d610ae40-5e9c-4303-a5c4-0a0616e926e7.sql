
-- 1. blocks table
CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX blocks_blocker_idx ON public.blocks (blocker_id);
CREATE INDEX blocks_blocked_idx ON public.blocks (blocked_id);

GRANT SELECT, INSERT, DELETE ON public.blocks TO authenticated;
GRANT ALL ON public.blocks TO service_role;

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blocks"
  ON public.blocks FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create their own blocks"
  ON public.blocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can remove their own blocks"
  ON public.blocks FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

-- 2. helper: is there a block in either direction?
CREATE OR REPLACE FUNCTION public.is_blocked_pair(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = _a AND blocked_id = _b)
       OR (blocker_id = _b AND blocked_id = _a)
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_blocked_pair(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_blocked_pair(uuid,uuid) TO authenticated;

-- 3. helper for the client: my blocks list (both directions of ids I shouldn't see)
CREATE OR REPLACE FUNCTION public.my_block_user_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT blocked_id FROM public.blocks WHERE blocker_id = auth.uid()
  UNION
  SELECT blocker_id FROM public.blocks WHERE blocked_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.my_block_user_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_block_user_ids() TO authenticated;

-- 4. get_match_deck — exclude blocked authors (both directions)
CREATE OR REPLACE FUNCTION public.get_match_deck(
  _intent text DEFAULT 'connection',
  _disciplines text[] DEFAULT '{}',
  _location text DEFAULT NULL,
  _availability text DEFAULT NULL,
  _experience text DEFAULT NULL,
  _account_types text[] DEFAULT '{}',
  _recency_days int DEFAULT NULL,
  _limit int DEFAULT 40
) RETURNS TABLE(
  post_id uuid, title text, caption text, media_paths text[], image_path text,
  category text, created_at timestamptz, author_id uuid, author_name text,
  author_username text, author_avatar_path text, author_account_type text,
  author_verified boolean, author_location text, author_disciplines text[]
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    p.id, p.title, p.caption, p.media_paths, p.image_path, p.category, p.created_at,
    pr.id, COALESCE(pr.display_name, pr.username), pr.username, pr.avatar_path,
    pr.account_type::text, (pr.verified_at IS NOT NULL),
    pr.location, pr.disciplines
  FROM public.posts p
  JOIN public.profiles pr ON pr.id = p.author_id
  WHERE p.author_id <> COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    AND p.on_explore = true
    AND (COALESCE(array_length(p.media_paths,1),0) > 0 OR p.image_path IS NOT NULL)
    AND (_intent <> 'collaboration' OR public.user_is_collab_seeking(pr.id))
    AND (COALESCE(array_length(_disciplines,1),0) = 0 OR pr.disciplines && _disciplines)
    AND (_location IS NULL OR _location = '' OR pr.location ILIKE '%' || _location || '%')
    AND (_availability IS NULL OR _availability = '' OR pr.availability = _availability)
    AND (_experience  IS NULL OR _experience  = '' OR pr.experience_level = _experience)
    AND (COALESCE(array_length(_account_types,1),0) = 0 OR pr.account_type::text = ANY(_account_types))
    AND (_recency_days IS NULL OR p.created_at >= now() - (_recency_days || ' days')::interval)
    AND NOT public.is_blocked_pair(auth.uid(), pr.id)
    AND NOT EXISTS (
      SELECT 1 FROM public.connection_requests cr
      WHERE cr.requester_id = auth.uid() AND cr.recipient_id = pr.id
    )
  ORDER BY p.created_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
$$;

-- 5. list_my_conversations — hide threads with anyone I have blocked or who has blocked me
CREATE OR REPLACE FUNCTION public.list_my_conversations()
RETURNS TABLE(conversation_id uuid, is_group boolean, other_user_id uuid,
              last_message_at timestamptz, last_message_preview text, last_read_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.is_group,
         (SELECT p2.user_id FROM public.conversation_participants p2
            WHERE p2.conversation_id = c.id AND p2.user_id <> auth.uid() LIMIT 1) AS other_user_id,
         c.last_message_at, c.last_message_preview, pme.last_read_at
  FROM public.conversations c
  JOIN public.conversation_participants pme
    ON pme.conversation_id = c.id AND pme.user_id = auth.uid()
  WHERE NOT EXISTS (
    SELECT 1 FROM public.conversation_participants pp
    WHERE pp.conversation_id = c.id
      AND pp.user_id <> auth.uid()
      AND public.is_blocked_pair(auth.uid(), pp.user_id)
  )
  ORDER BY c.last_message_at DESC;
$$;

-- 6. ensure_dm_conversation — refuse when blocked either direction
CREATE OR REPLACE FUNCTION public.ensure_dm_conversation(_other uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_me uuid := auth.uid(); v_conv uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _other IS NULL OR _other = v_me THEN RAISE EXCEPTION 'invalid recipient'; END IF;
  IF public.is_blocked_pair(v_me, _other) THEN RAISE EXCEPTION 'blocked'; END IF;

  SELECT c.id INTO v_conv
  FROM public.conversations c
  WHERE c.is_group = false
    AND EXISTS (SELECT 1 FROM public.conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = v_me)
    AND EXISTS (SELECT 1 FROM public.conversation_participants p WHERE p.conversation_id = c.id AND p.user_id = _other)
    AND (SELECT count(*) FROM public.conversation_participants p WHERE p.conversation_id = c.id) = 2
  LIMIT 1;

  IF v_conv IS NOT NULL THEN RETURN v_conv; END IF;

  INSERT INTO public.conversations (is_group) VALUES (false) RETURNING id INTO v_conv;
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (v_conv, v_me), (v_conv, _other);
  RETURN v_conv;
END $$;

-- 7. Trigger: prevent dm_messages when sender/recipient blocked
CREATE OR REPLACE FUNCTION public.guard_dm_message_blocks()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT user_id FROM public.conversation_participants
    WHERE conversation_id = NEW.conversation_id AND user_id <> NEW.sender_id
  LOOP
    IF public.is_blocked_pair(NEW.sender_id, r.user_id) THEN
      RAISE EXCEPTION 'blocked';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_dm_message_blocks_trg ON public.dm_messages;
CREATE TRIGGER guard_dm_message_blocks_trg
  BEFORE INSERT ON public.dm_messages
  FOR EACH ROW EXECUTE FUNCTION public.guard_dm_message_blocks();

-- 8. Trigger: prevent comments when commenter/post-author blocked either way
CREATE OR REPLACE FUNCTION public.guard_comment_blocks()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_author uuid;
BEGIN
  SELECT author_id INTO v_author FROM public.posts WHERE id = NEW.post_id;
  IF v_author IS NOT NULL AND public.is_blocked_pair(NEW.author_id, v_author) THEN
    RAISE EXCEPTION 'blocked';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_comment_blocks_trg ON public.comments;
CREATE TRIGGER guard_comment_blocks_trg
  BEFORE INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.guard_comment_blocks();

-- 9. Notification trigger updates — drop notification if pair is blocked
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_author uuid;
BEGIN
  SELECT author_id INTO v_author FROM public.posts WHERE id = NEW.post_id;
  IF v_author IS NULL OR v_author = NEW.author_id THEN RETURN NEW; END IF;
  IF public.is_blocked_pair(v_author, NEW.author_id) THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
  VALUES (v_author, 'comment', NEW.author_id, 'post', NEW.post_id::text, 'commented on your work');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.notify_on_interaction()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_author uuid; v_body text;
BEGIN
  IF NEW.target_kind <> 'post' THEN RETURN NEW; END IF;
  IF NEW.kind NOT IN ('like','save','pin','comment') THEN RETURN NEW; END IF;
  BEGIN
    SELECT author_id INTO v_author FROM public.posts WHERE id::text = NEW.target_id;
  EXCEPTION WHEN OTHERS THEN RETURN NEW;
  END;
  IF v_author IS NULL OR v_author = NEW.user_id THEN RETURN NEW; END IF;
  IF public.is_blocked_pair(v_author, NEW.user_id) THEN RETURN NEW; END IF;
  v_body := CASE NEW.kind
    WHEN 'like' THEN 'liked your work'
    WHEN 'save' THEN 'saved your work'
    WHEN 'pin' THEN 'pinned your work'
    WHEN 'comment' THEN 'commented on your work'
  END;
  INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
  VALUES (v_author, NEW.kind, NEW.user_id, 'post', NEW.target_id, v_body);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.notify_on_connection_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    IF public.is_blocked_pair(NEW.requester_id, NEW.recipient_id) THEN RETURN NEW; END IF;
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (NEW.recipient_id, 'connect', NEW.requester_id, 'user', NEW.requester_id::text, 'wants to connect');
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
    IF public.is_blocked_pair(NEW.requester_id, NEW.recipient_id) THEN RETURN NEW; END IF;
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (NEW.requester_id, 'connect', NEW.recipient_id, 'user', NEW.recipient_id::text, 'accepted your connection request');
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.on_new_dm_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  UPDATE public.conversations
     SET last_message_at = NEW.created_at,
         last_message_preview = left(NEW.body, 140)
   WHERE id = NEW.conversation_id;

  FOR r IN
    SELECT user_id FROM public.conversation_participants
    WHERE conversation_id = NEW.conversation_id AND user_id <> NEW.sender_id
  LOOP
    IF public.is_blocked_pair(NEW.sender_id, r.user_id) THEN CONTINUE; END IF;
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (r.user_id, 'message', NEW.sender_id, 'conversation', NEW.conversation_id::text, 'sent you a message');
  END LOOP;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.notify_mentions_in_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE handle text; target_id uuid;
BEGIN
  FOR handle IN
    SELECT DISTINCT lower(m[1])
    FROM regexp_matches(NEW.body, '@([a-z0-9_.]{3,20})', 'g') AS m
  LOOP
    SELECT id INTO target_id FROM public.profiles WHERE username = handle;
    IF target_id IS NULL OR target_id = NEW.author_id THEN CONTINUE; END IF;
    IF public.is_blocked_pair(target_id, NEW.author_id) THEN CONTINUE; END IF;
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (target_id, 'mention', NEW.author_id, 'post', NEW.post_id::text, 'mentioned you in a comment');
  END LOOP;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;
