
-- ============ ENUM ============
DO $$ BEGIN
  CREATE TYPE public.collab_member_status AS ENUM ('invited','active','declined','left');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ collaborations ============
CREATE TABLE public.collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  brief text NOT NULL DEFAULT '',
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collaborations TO authenticated;
GRANT ALL ON public.collaborations TO service_role;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- ============ collaboration_members ============
CREATE TABLE public.collaboration_members (
  collab_id uuid NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT '',
  status public.collab_member_status NOT NULL DEFAULT 'invited',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collab_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collaboration_members TO authenticated;
GRANT ALL ON public.collaboration_members TO service_role;
ALTER TABLE public.collaboration_members ENABLE ROW LEVEL SECURITY;

-- ============ collaboration_tasks ============
CREATE TABLE public.collaboration_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collab_id uuid NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collaboration_tasks TO authenticated;
GRANT ALL ON public.collaboration_tasks TO service_role;
ALTER TABLE public.collaboration_tasks ENABLE ROW LEVEL SECURITY;

-- ============ collaboration_milestones ============
CREATE TABLE public.collaboration_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collab_id uuid NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
  title text NOT NULL,
  due_date date,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collaboration_milestones TO authenticated;
GRANT ALL ON public.collaboration_milestones TO service_role;
ALTER TABLE public.collaboration_milestones ENABLE ROW LEVEL SECURITY;

-- ============ helper (security definer to bypass RLS recursion) ============
CREATE OR REPLACE FUNCTION public.is_collab_member(_collab uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.collaboration_members
    WHERE collab_id = _collab AND user_id = _user
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_collab_member(_collab uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.collaboration_members
    WHERE collab_id = _collab AND user_id = _user AND status = 'active'
  );
$$;

-- ============ touch updated_at ============
CREATE OR REPLACE FUNCTION public.touch_collab_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER collaborations_touch BEFORE UPDATE ON public.collaborations
  FOR EACH ROW EXECUTE FUNCTION public.touch_collab_updated_at();
CREATE TRIGGER collab_members_touch BEFORE UPDATE ON public.collaboration_members
  FOR EACH ROW EXECUTE FUNCTION public.touch_collab_updated_at();
CREATE TRIGGER collab_tasks_touch BEFORE UPDATE ON public.collaboration_tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_collab_updated_at();
CREATE TRIGGER collab_milestones_touch BEFORE UPDATE ON public.collaboration_milestones
  FOR EACH ROW EXECUTE FUNCTION public.touch_collab_updated_at();

-- ============ RLS policies ============

-- collaborations: members can read; owner can update title/brief; anyone authenticated can insert (owner must be self)
CREATE POLICY "collab read by members" ON public.collaborations
  FOR SELECT TO authenticated USING (public.is_collab_member(id, auth.uid()));
CREATE POLICY "collab insert by owner self" ON public.collaborations
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "collab update by owner" ON public.collaborations
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "collab delete by owner" ON public.collaborations
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- collaboration_members: members can see all rows for collabs they belong to;
-- inserts done by owner OR by accepting your own row; user can update their own row (accept/decline);
-- owner can update/delete any row.
CREATE POLICY "members read in own collabs" ON public.collaboration_members
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.is_collab_member(collab_id, auth.uid())
  );
CREATE POLICY "members insert by owner" ON public.collaboration_members
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.collaborations c WHERE c.id = collab_id AND c.owner_id = auth.uid())
  );
CREATE POLICY "members update self or owner" ON public.collaboration_members
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.collaborations c WHERE c.id = collab_id AND c.owner_id = auth.uid())
  ) WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.collaborations c WHERE c.id = collab_id AND c.owner_id = auth.uid())
  );
CREATE POLICY "members delete self or owner" ON public.collaboration_members
  FOR DELETE TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.collaborations c WHERE c.id = collab_id AND c.owner_id = auth.uid())
  );

-- tasks / milestones: active members only can read & write
CREATE POLICY "tasks read by members" ON public.collaboration_tasks
  FOR SELECT TO authenticated USING (public.is_collab_member(collab_id, auth.uid()));
CREATE POLICY "tasks write by active" ON public.collaboration_tasks
  FOR INSERT TO authenticated WITH CHECK (public.is_active_collab_member(collab_id, auth.uid()));
CREATE POLICY "tasks update by active" ON public.collaboration_tasks
  FOR UPDATE TO authenticated USING (public.is_active_collab_member(collab_id, auth.uid()))
  WITH CHECK (public.is_active_collab_member(collab_id, auth.uid()));
CREATE POLICY "tasks delete by active" ON public.collaboration_tasks
  FOR DELETE TO authenticated USING (public.is_active_collab_member(collab_id, auth.uid()));

CREATE POLICY "ms read by members" ON public.collaboration_milestones
  FOR SELECT TO authenticated USING (public.is_collab_member(collab_id, auth.uid()));
CREATE POLICY "ms write by active" ON public.collaboration_milestones
  FOR INSERT TO authenticated WITH CHECK (public.is_active_collab_member(collab_id, auth.uid()));
CREATE POLICY "ms update by active" ON public.collaboration_milestones
  FOR UPDATE TO authenticated USING (public.is_active_collab_member(collab_id, auth.uid()))
  WITH CHECK (public.is_active_collab_member(collab_id, auth.uid()));
CREATE POLICY "ms delete by active" ON public.collaboration_milestones
  FOR DELETE TO authenticated USING (public.is_active_collab_member(collab_id, auth.uid()));

-- ============ Notifications: invite, accept, task assignment ============
CREATE OR REPLACE FUNCTION public.notify_on_collab_member()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_title text;
BEGIN
  SELECT title INTO v_title FROM public.collaborations WHERE id = NEW.collab_id;
  IF TG_OP = 'INSERT' AND NEW.status = 'invited' AND NEW.user_id <> COALESCE(NEW.invited_by, NEW.user_id) THEN
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (NEW.user_id, 'collab_invite', NEW.invited_by, 'collab', NEW.collab_id::text,
            'invited you to collaborate on ' || COALESCE(v_title,'a project'));
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status = 'invited' THEN
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    SELECT c.owner_id, 'collab_accept', NEW.user_id, 'collab', NEW.collab_id::text,
           'accepted your collaboration invite'
    FROM public.collaborations c WHERE c.id = NEW.collab_id AND c.owner_id <> NEW.user_id;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

CREATE TRIGGER collab_members_notify
AFTER INSERT OR UPDATE ON public.collaboration_members
FOR EACH ROW EXECUTE FUNCTION public.notify_on_collab_member();

CREATE OR REPLACE FUNCTION public.notify_on_task_assign()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_actor uuid := auth.uid(); v_title text;
BEGIN
  IF NEW.assignee_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND NEW.assignee_id IS NOT DISTINCT FROM OLD.assignee_id THEN RETURN NEW; END IF;
  IF NEW.assignee_id = v_actor THEN RETURN NEW; END IF;
  SELECT title INTO v_title FROM public.collaborations WHERE id = NEW.collab_id;
  INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
  VALUES (NEW.assignee_id, 'task_assigned', v_actor, 'collab', NEW.collab_id::text,
          'assigned you a task in ' || COALESCE(v_title,'a collaboration'));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $$;

CREATE TRIGGER collab_tasks_notify
AFTER INSERT OR UPDATE OF assignee_id ON public.collaboration_tasks
FOR EACH ROW EXECUTE FUNCTION public.notify_on_task_assign();

-- ============ Realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_milestones;

-- ============ RPC: create collaboration with conversation + invites ============
CREATE OR REPLACE FUNCTION public.create_collaboration(_title text, _brief text, _member_ids uuid[])
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_collab uuid;
  v_conv uuid;
  v_uid uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _title IS NULL OR length(btrim(_title)) = 0 THEN RAISE EXCEPTION 'title required'; END IF;

  INSERT INTO public.conversations (is_group) VALUES (true) RETURNING id INTO v_conv;
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (v_conv, v_me);

  INSERT INTO public.collaborations (title, brief, owner_id, conversation_id)
  VALUES (btrim(_title), COALESCE(_brief,''), v_me, v_conv)
  RETURNING id INTO v_collab;

  INSERT INTO public.collaboration_members (collab_id, user_id, status, invited_by)
  VALUES (v_collab, v_me, 'active', v_me);

  IF _member_ids IS NOT NULL THEN
    FOREACH v_uid IN ARRAY _member_ids LOOP
      IF v_uid IS NOT NULL AND v_uid <> v_me THEN
        INSERT INTO public.collaboration_members (collab_id, user_id, status, invited_by)
        VALUES (v_collab, v_uid, 'invited', v_me)
        ON CONFLICT (collab_id, user_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  RETURN v_collab;
END $$;

-- ============ RPC: invite more members ============
CREATE OR REPLACE FUNCTION public.invite_to_collaboration(_collab uuid, _member_ids uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_me uuid := auth.uid(); v_owner uuid; v_uid uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT owner_id INTO v_owner FROM public.collaborations WHERE id = _collab;
  IF v_owner IS NULL OR v_owner <> v_me THEN RAISE EXCEPTION 'only owner can invite'; END IF;
  FOREACH v_uid IN ARRAY _member_ids LOOP
    IF v_uid IS NOT NULL AND v_uid <> v_me THEN
      INSERT INTO public.collaboration_members (collab_id, user_id, status, invited_by)
      VALUES (_collab, v_uid, 'invited', v_me)
      ON CONFLICT (collab_id, user_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ============ RPC: respond to invite (accept / decline) ============
CREATE OR REPLACE FUNCTION public.respond_collab_invite(_collab uuid, _accept boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_me uuid := auth.uid(); v_conv uuid;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.collaboration_members
    SET status = CASE WHEN _accept THEN 'active'::public.collab_member_status
                      ELSE 'declined'::public.collab_member_status END
    WHERE collab_id = _collab AND user_id = v_me AND status = 'invited';
  IF _accept THEN
    SELECT conversation_id INTO v_conv FROM public.collaborations WHERE id = _collab;
    IF v_conv IS NOT NULL THEN
      INSERT INTO public.conversation_participants (conversation_id, user_id)
      VALUES (v_conv, v_me)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- ============ RPC: list my collaborations ============
CREATE OR REPLACE FUNCTION public.list_my_collaborations()
RETURNS TABLE (
  id uuid, title text, brief text, owner_id uuid, conversation_id uuid,
  created_at timestamptz, updated_at timestamptz,
  my_status public.collab_member_status,
  member_count int, task_count int, task_done int
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.title, c.brief, c.owner_id, c.conversation_id, c.created_at, c.updated_at,
         m.status AS my_status,
         (SELECT count(*)::int FROM public.collaboration_members mm WHERE mm.collab_id = c.id AND mm.status = 'active') AS member_count,
         (SELECT count(*)::int FROM public.collaboration_tasks t WHERE t.collab_id = c.id) AS task_count,
         (SELECT count(*)::int FROM public.collaboration_tasks t WHERE t.collab_id = c.id AND t.done) AS task_done
  FROM public.collaborations c
  JOIN public.collaboration_members m ON m.collab_id = c.id AND m.user_id = auth.uid()
  ORDER BY c.updated_at DESC;
$$;
