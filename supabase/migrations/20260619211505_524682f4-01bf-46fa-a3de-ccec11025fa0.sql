
-- 1) Tighten always-true INSERT policies
DROP POLICY IF EXISTS "anyone can submit registration request" ON public.institution_registration_requests;
CREATE POLICY "signed-in can submit registration request"
  ON public.institution_registration_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Signed-in users can insert anonymous salary entries" ON public.salary_entries;
CREATE POLICY "Signed-in users can insert anonymous salary entries"
  ON public.salary_entries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2) Internal email-queue helpers: set search_path, restrict execute
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint)                SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb)    SET search_path = public, pgmq;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='enqueue_email') THEN
    EXECUTE 'ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq';
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint)                FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb)    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint)                TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb)    TO service_role;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
             WHERE n.nspname='public' AND p.proname='enqueue_email') THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role';
  END IF;
END $$;

-- 3) Foreign-key indexes
CREATE INDEX IF NOT EXISTS idx_competition_user_state_competition_id ON public.competition_user_state(competition_id);
CREATE INDEX IF NOT EXISTS idx_inst_reg_req_submitted_by             ON public.institution_registration_requests(submitted_by);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id                ON public.notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_dm_messages_sender_id                 ON public.dm_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_conversation_id        ON public.collaborations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_owner_id               ON public.collaborations(owner_id);
CREATE INDEX IF NOT EXISTS idx_collab_members_invited_by             ON public.collaboration_members(invited_by);
CREATE INDEX IF NOT EXISTS idx_collab_members_user_id                ON public.collaboration_members(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_tasks_assignee_id              ON public.collaboration_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_collab_tasks_collab_id                ON public.collaboration_tasks(collab_id);
CREATE INDEX IF NOT EXISTS idx_collab_tasks_created_by               ON public.collaboration_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_collab_milestones_collab_id           ON public.collaboration_milestones(collab_id);
CREATE INDEX IF NOT EXISTS idx_classes_conversation_id               ON public.classes(conversation_id);
CREATE INDEX IF NOT EXISTS idx_classes_professor_id                  ON public.classes(professor_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user_id                 ON public.class_members(user_id);
CREATE INDEX IF NOT EXISTS idx_class_documents_class_id              ON public.class_documents(class_id);
CREATE INDEX IF NOT EXISTS idx_class_documents_uploader_id           ON public.class_documents(uploader_id);
CREATE INDEX IF NOT EXISTS idx_class_invites_class_id                ON public.class_invites(class_id);
CREATE INDEX IF NOT EXISTS idx_class_invites_invited_by              ON public.class_invites(invited_by);
