
-- =========================================================
-- 1) Profiles: lock sensitive columns to the owner only
-- =========================================================
-- The "Profiles: select public fields" policy uses USING (true) so RLS allows
-- the row; column-level grants now restrict which columns are returned.
-- Owner reads of private columns go through SECURITY DEFINER RPCs
-- (get_my_marketing_opt_in, get_practice_status, get_my_onboarding_seen).

REVOKE SELECT ON public.profiles FROM authenticated;
REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (
  id, account_type, display_name, username, disciplines, bio, location, links,
  avatar_path, banner_path, verified_at, created_at, updated_at,
  institution_id, institution_role, institution_verified_at,
  open_to_collaborate, availability, experience_level
) ON public.profiles TO authenticated;

-- Some pre-auth lookups (e.g. profile_id_by_username) run as SECURITY DEFINER
-- so column grants don't matter; nothing readable here for anon by default.

-- =========================================================
-- 2) Onboarding-seen RPC for the owner
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_my_onboarding_seen()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT onboarding_seen_at IS NOT NULL FROM public.profiles WHERE id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_onboarding_seen() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_onboarding_seen() TO authenticated, service_role;

-- =========================================================
-- 3) institution_registration_requests — owner-only SELECT
-- =========================================================
DROP POLICY IF EXISTS "submitter can read own registration request"
  ON public.institution_registration_requests;
CREATE POLICY "submitter can read own registration request"
  ON public.institution_registration_requests
  FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

-- =========================================================
-- 4) boost_impressions — explicit INSERT policy (own viewer_id)
-- =========================================================
DROP POLICY IF EXISTS "viewer can insert own boost impression"
  ON public.boost_impressions;
CREATE POLICY "viewer can insert own boost impression"
  ON public.boost_impressions
  FOR INSERT
  TO authenticated
  WITH CHECK (viewer_id IS NULL OR viewer_id = auth.uid());

-- =========================================================
-- 5) conversation_participants — explicit INSERT policy
-- =========================================================
DROP POLICY IF EXISTS "users can add themselves as participant"
  ON public.conversation_participants;
CREATE POLICY "users can add themselves as participant"
  ON public.conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =========================================================
-- 6) Realtime: only signed-in users can subscribe / publish
-- =========================================================
-- The actual row-level filtering on changes (dm_messages, notifications, …)
-- continues to be enforced by each table's own RLS policy.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated can read realtime messages" ON realtime.messages;
CREATE POLICY "authenticated can read realtime messages"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated can publish realtime messages" ON realtime.messages;
CREATE POLICY "authenticated can publish realtime messages"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =========================================================
-- 7) class_invites — protect tokens from inviters; add safe RPC
-- =========================================================
DROP POLICY IF EXISTS "class_invites_select" ON public.class_invites;
CREATE POLICY "class_invites_select"
  ON public.class_invites
  FOR SELECT
  TO authenticated
  USING (public.is_class_professor(class_id, auth.uid()));

-- Revoke direct read on the raw token column from authenticated; only the
-- service role (used by accept_class_invite SECURITY DEFINER) sees the column.
REVOKE SELECT (token) ON public.class_invites FROM authenticated;

-- RPC the invited TA calls on the accept page to render the class name + their
-- email without ever exposing other invites' tokens.
CREATE OR REPLACE FUNCTION public.get_class_invite_for_acceptance(_token text)
RETURNS TABLE(class_name text, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.name, i.email
  FROM public.class_invites i
  JOIN public.classes c ON c.id = i.class_id
  WHERE i.token = _token AND i.status = 'pending'
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_class_invite_for_acceptance(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_class_invite_for_acceptance(text) TO anon, authenticated, service_role;

-- =========================================================
-- 8) effective_plan: set immutable search_path
-- =========================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT format(
      'ALTER FUNCTION public.%I(%s) SET search_path = public;',
      p.proname, pg_get_function_identity_arguments(p.oid)
    ) AS stmt
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
    WHERE n.nspname = 'public'
      AND d.objid IS NULL
      AND (p.proconfig IS NULL OR NOT (p.proconfig::text LIKE '%search_path%'))
  LOOP
    EXECUTE r.stmt;
  END LOOP;
END $$;

-- =========================================================
-- 9) Revoke EXECUTE on user-defined SECURITY DEFINER funcs from PUBLIC + anon
--    (allowlist of pre-auth callable RPCs preserved below)
-- =========================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT format(
      'REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon;',
      p.proname, pg_get_function_identity_arguments(p.oid)
    ) AS stmt
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    LEFT JOIN pg_depend d ON d.objid = p.oid AND d.deptype = 'e'
    WHERE n.nspname = 'public'
      AND d.objid IS NULL
      AND p.prosecdef = true
      AND p.proname NOT IN (
        'check_username_available',
        'profile_id_by_username',
        'get_class_invite_for_acceptance'
      )
  LOOP
    EXECUTE r.stmt;
  END LOOP;
END $$;

-- Ensure pre-auth callable RPCs keep working from anon/authenticated.
GRANT EXECUTE ON FUNCTION public.check_username_available(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.profile_id_by_username(text) TO anon, authenticated;
