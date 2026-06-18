
-- Tables
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group boolean NOT NULL DEFAULT false,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  last_message_preview text
);

CREATE TABLE public.conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz NOT NULL DEFAULT 'epoch',
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX conversation_participants_user_idx ON public.conversation_participants(user_id);

CREATE TABLE public.dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(btrim(body)) > 0 AND length(body) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dm_messages_conv_idx ON public.dm_messages(conversation_id, created_at);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_participants TO authenticated;
GRANT ALL ON public.conversation_participants TO service_role;
GRANT SELECT, INSERT ON public.dm_messages TO authenticated;
GRANT ALL ON public.dm_messages TO service_role;

-- Helper: am I a participant? (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conv uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conv AND user_id = _user
  );
$$;

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read their conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_participant(id, auth.uid()));
CREATE POLICY "Participants can update their conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_conversation_participant(id, auth.uid()))
  WITH CHECK (public.is_conversation_participant(id, auth.uid()));

CREATE POLICY "Users can read their own participant row"
  ON public.conversation_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can update their own participant row"
  ON public.conversation_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Participants can read messages"
  ON public.dm_messages FOR SELECT TO authenticated
  USING (public.is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "Participants can send messages as themselves"
  ON public.dm_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_participant(conversation_id, auth.uid())
  );

-- Find-or-create a 1:1 DM conversation between auth.uid() and _other.
CREATE OR REPLACE FUNCTION public.ensure_dm_conversation(_other uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_conv uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _other IS NULL OR _other = v_me THEN RAISE EXCEPTION 'invalid recipient'; END IF;

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
END;
$$;

-- List my conversations with the other participant id (1:1 only).
CREATE OR REPLACE FUNCTION public.list_my_conversations()
RETURNS TABLE(
  conversation_id uuid,
  is_group boolean,
  other_user_id uuid,
  last_message_at timestamptz,
  last_message_preview text,
  last_read_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id,
         c.is_group,
         (SELECT p2.user_id FROM public.conversation_participants p2
            WHERE p2.conversation_id = c.id AND p2.user_id <> auth.uid() LIMIT 1) AS other_user_id,
         c.last_message_at,
         c.last_message_preview,
         pme.last_read_at
  FROM public.conversations c
  JOIN public.conversation_participants pme
    ON pme.conversation_id = c.id AND pme.user_id = auth.uid()
  ORDER BY c.last_message_at DESC;
$$;

-- On new message: bump conversation preview and notify other participants.
CREATE OR REPLACE FUNCTION public.on_new_dm_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (r.user_id, 'message', NEW.sender_id, 'conversation', NEW.conversation_id::text, 'sent you a message');
  END LOOP;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE TRIGGER dm_messages_after_insert
AFTER INSERT ON public.dm_messages
FOR EACH ROW EXECUTE FUNCTION public.on_new_dm_message();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER TABLE public.dm_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
