-- Fix 4 actionable security findings without changing app features

-- 1 & 2. Drop overly-permissive storage policies on class-docs (owner-prefix bypass).
-- Keep the staff/member-scoped policies which already cover legitimate access.
DROP POLICY IF EXISTS "class-docs owner insert" ON storage.objects;
DROP POLICY IF EXISTS "class-docs owner update" ON storage.objects;
DROP POLICY IF EXISTS "class-docs owner delete" ON storage.objects;
DROP POLICY IF EXISTS "class-docs owner read"   ON storage.objects;

-- 3. Scope class_invites SELECT/UPDATE to the issuing professor only (still allow class professor to see invites they created).
DROP POLICY IF EXISTS "class_invites_select" ON public.class_invites;
DROP POLICY IF EXISTS "class_invites_update" ON public.class_invites;

CREATE POLICY "class_invites_select"
  ON public.class_invites
  FOR SELECT
  TO authenticated
  USING (
    invited_by = auth.uid()
  );

CREATE POLICY "class_invites_update"
  ON public.class_invites
  FOR UPDATE
  TO authenticated
  USING (invited_by = auth.uid())
  WITH CHECK (invited_by = auth.uid());

-- 4. Replace SELECT policies that use is_collab_member with the status-checked variant
-- so users who were only invited (not active) cannot read private collaboration data.

-- collaborations
DROP POLICY IF EXISTS "collaborations_select" ON public.collaborations;
CREATE POLICY "collaborations_select"
  ON public.collaborations
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_active_collab_member(id, auth.uid())
    -- Invited (pending) members still need to see the collab title to respond.
    OR EXISTS (
      SELECT 1 FROM public.collaboration_members m
      WHERE m.collab_id = collaborations.id
        AND m.user_id = auth.uid()
        AND m.status = 'invited'
    )
  );

-- collaboration_tasks
DROP POLICY IF EXISTS "collab_tasks_select" ON public.collaboration_tasks;
CREATE POLICY "collab_tasks_select"
  ON public.collaboration_tasks
  FOR SELECT
  TO authenticated
  USING (public.is_active_collab_member(collab_id, auth.uid()));

-- collaboration_milestones
DROP POLICY IF EXISTS "collab_milestones_select" ON public.collaboration_milestones;
CREATE POLICY "collab_milestones_select"
  ON public.collaboration_milestones
  FOR SELECT
  TO authenticated
  USING (public.is_active_collab_member(collab_id, auth.uid()));
