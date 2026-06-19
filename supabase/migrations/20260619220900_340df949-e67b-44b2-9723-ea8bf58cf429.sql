
-- 1) class_members: remove the "any user can self-insert" branch.
--    All student enrollment goes through accept_class_invite (SECURITY DEFINER).
DROP POLICY IF EXISTS class_members_insert ON public.class_members;
CREATE POLICY class_members_insert ON public.class_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_class_professor(class_id, auth.uid()));

-- 2) conversation_participants: remove the open self-insert.
--    All participant additions happen via SECURITY DEFINER RPCs
--    (ensure_dm_conversation, accept_class_invite, respond_collab_invite, etc.)
DROP POLICY IF EXISTS "users can add themselves as participant" ON public.conversation_participants;
-- No INSERT policy remains, so direct client inserts are denied.
-- SELECT / UPDATE policies (own row) are unchanged.

-- 3) realtime.messages: lock broadcast/presence channel.
--    The app uses postgres_changes which is governed by table-level RLS,
--    so dropping these permissive policies does not affect existing realtime flows.
DROP POLICY IF EXISTS "authenticated can read realtime messages" ON realtime.messages;
DROP POLICY IF EXISTS "authenticated can publish realtime messages" ON realtime.messages;
