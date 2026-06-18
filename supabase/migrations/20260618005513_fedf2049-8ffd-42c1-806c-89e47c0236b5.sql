
-- 1. Status enum
DO $$ BEGIN
  CREATE TYPE public.connection_status AS ENUM ('pending','accepted','declined','dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Table
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  status public.connection_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT connection_requests_no_self CHECK (requester_id <> recipient_id),
  CONSTRAINT connection_requests_unique UNIQUE (requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS connection_requests_recipient_idx
  ON public.connection_requests (recipient_id, status);
CREATE INDEX IF NOT EXISTS connection_requests_requester_idx
  ON public.connection_requests (requester_id, status);

-- 3. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connection_requests TO authenticated;
GRANT ALL ON public.connection_requests TO service_role;

-- 4. RLS
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests visible to participants" ON public.connection_requests;
CREATE POLICY "requests visible to participants"
  ON public.connection_requests FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "users can create their own requests" ON public.connection_requests;
CREATE POLICY "users can create their own requests"
  ON public.connection_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

-- Recipient can accept/decline; either side can dismiss/withdraw their own row.
DROP POLICY IF EXISTS "participants can update" ON public.connection_requests;
CREATE POLICY "participants can update"
  ON public.connection_requests FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "requester can delete own request" ON public.connection_requests;
CREATE POLICY "requester can delete own request"
  ON public.connection_requests FOR DELETE TO authenticated
  USING (auth.uid() = requester_id);

-- 5. updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_connection_requests_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS connection_requests_touch ON public.connection_requests;
CREATE TRIGGER connection_requests_touch
  BEFORE UPDATE ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_connection_requests_updated_at();

-- 6. Notification trigger
CREATE OR REPLACE FUNCTION public.notify_on_connection_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (NEW.recipient_id, 'connect', NEW.requester_id, 'user', NEW.requester_id::text, 'wants to connect');
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
    -- Notify the original requester that their request was accepted.
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (NEW.requester_id, 'connect', NEW.recipient_id, 'user', NEW.recipient_id::text, 'accepted your connection request');
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS connection_requests_notify ON public.connection_requests;
CREATE TRIGGER connection_requests_notify
  AFTER INSERT OR UPDATE ON public.connection_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_connection_request();

-- 7. Like-to-connect helper. Returns the resulting status so the client knows
--    whether it's a mutual match.
CREATE OR REPLACE FUNCTION public.like_to_connect(_target uuid)
RETURNS TABLE(status text, mutual boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_other_pending boolean;
  v_existing public.connection_status;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _target IS NULL OR _target = v_me THEN RAISE EXCEPTION 'invalid target'; END IF;

  -- Has the other party already liked me?
  SELECT TRUE INTO v_other_pending
  FROM public.connection_requests
  WHERE requester_id = _target AND recipient_id = v_me AND status = 'pending'
  LIMIT 1;

  IF v_other_pending THEN
    -- Accept their request, and ensure my side exists as accepted too.
    UPDATE public.connection_requests
       SET status = 'accepted'
     WHERE requester_id = _target AND recipient_id = v_me;
    INSERT INTO public.connection_requests (requester_id, recipient_id, status)
    VALUES (v_me, _target, 'accepted')
    ON CONFLICT (requester_id, recipient_id) DO UPDATE SET status = 'accepted';
    RETURN QUERY SELECT 'accepted'::text, TRUE;
    RETURN;
  END IF;

  -- Otherwise create or refresh a pending request from me.
  SELECT status INTO v_existing
  FROM public.connection_requests
  WHERE requester_id = v_me AND recipient_id = _target;

  IF v_existing IS NULL THEN
    INSERT INTO public.connection_requests (requester_id, recipient_id, status)
    VALUES (v_me, _target, 'pending');
  ELSIF v_existing IN ('declined','dismissed') THEN
    UPDATE public.connection_requests SET status = 'pending'
     WHERE requester_id = v_me AND recipient_id = _target;
  END IF;

  RETURN QUERY SELECT 'pending'::text, FALSE;
END;
$$;
REVOKE ALL ON FUNCTION public.like_to_connect(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.like_to_connect(uuid) TO authenticated;

-- 8. Pass-to-dismiss helper so a passed maker doesn't reappear.
CREATE OR REPLACE FUNCTION public.pass_on_maker(_target uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL OR _target IS NULL OR _target = v_me THEN RETURN; END IF;
  INSERT INTO public.connection_requests (requester_id, recipient_id, status)
  VALUES (v_me, _target, 'dismissed')
  ON CONFLICT (requester_id, recipient_id) DO UPDATE
    SET status = CASE WHEN public.connection_requests.status IN ('pending','accepted')
                      THEN public.connection_requests.status ELSE 'dismissed' END;
END;
$$;
REVOKE ALL ON FUNCTION public.pass_on_maker(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pass_on_maker(uuid) TO authenticated;
