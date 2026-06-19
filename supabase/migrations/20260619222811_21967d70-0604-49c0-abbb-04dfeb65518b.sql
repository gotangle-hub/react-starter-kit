
-- ===========================================================================
-- 1. INSTITUTIONS: physically remove regex columns from the public table.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.institution_email_patterns (
  institution_id uuid PRIMARY KEY REFERENCES public.institutions(id) ON DELETE CASCADE,
  faculty_email_regex text,
  student_email_regex text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- service_role only; no anon/authenticated grants whatsoever.
GRANT ALL ON public.institution_email_patterns TO service_role;
ALTER TABLE public.institution_email_patterns ENABLE ROW LEVEL SECURITY;
-- No policies = default deny for everyone except service_role (which bypasses RLS).

-- Copy any existing regex data over before dropping the columns.
INSERT INTO public.institution_email_patterns (institution_id, faculty_email_regex, student_email_regex)
SELECT id, faculty_email_regex, student_email_regex
  FROM public.institutions
 WHERE faculty_email_regex IS NOT NULL OR student_email_regex IS NOT NULL
ON CONFLICT (institution_id) DO UPDATE
  SET faculty_email_regex = EXCLUDED.faculty_email_regex,
      student_email_regex = EXCLUDED.student_email_regex,
      updated_at = now();

-- Now drop the publicly-exposed columns.
ALTER TABLE public.institutions DROP COLUMN IF EXISTS faculty_email_regex;
ALTER TABLE public.institutions DROP COLUMN IF EXISTS student_email_regex;

-- Re-grant SELECT on the remaining institutions columns (drop column doesn't
-- change grants but re-affirming keeps the surface explicit).
GRANT SELECT ON public.institutions TO anon, authenticated;

-- Rewrite detect_institution_role to read from the private patterns table.
CREATE OR REPLACE FUNCTION public.detect_institution_role(_institution_id uuid, _email text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pat public.institution_email_patterns%ROWTYPE;
  local_part text;
BEGIN
  IF _email IS NULL OR _institution_id IS NULL THEN RETURN 'student'; END IF;
  SELECT * INTO pat FROM public.institution_email_patterns WHERE institution_id = _institution_id;
  local_part := lower(split_part(_email, '@', 1));
  IF FOUND THEN
    BEGIN
      IF pat.faculty_email_regex IS NOT NULL AND local_part ~* pat.faculty_email_regex THEN RETURN 'faculty'; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN
      IF pat.student_email_regex IS NOT NULL AND local_part ~* pat.student_email_regex THEN RETURN 'student'; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
  IF local_part ~ '\d{6,}' THEN RETURN 'student'; END IF;
  RETURN 'faculty';
END;
$$;

-- link_institution_membership likely reads the regex columns too — patch it to use the new table.
CREATE OR REPLACE FUNCTION public.link_institution_membership(_institution_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  v_email text;
  v_email_domain text;
  v_inst public.institutions%ROWTYPE;
  v_pat public.institution_email_patterns%ROWTYPE;
  v_role text;
  v_local text;
  v_ambig boolean := false;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = uid;
  IF v_email IS NULL THEN RAISE EXCEPTION 'no email on account'; END IF;
  SELECT * INTO v_inst FROM public.institutions WHERE id = _institution_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'unknown institution'; END IF;

  v_email_domain := lower(split_part(v_email, '@', 2));
  IF v_email_domain <> lower(v_inst.domain)
     AND NOT (v_email_domain = ANY(ARRAY(SELECT lower(x) FROM unnest(v_inst.alt_domains) AS x))) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'domain_mismatch',
                              'expected_domain', v_inst.domain, 'email', v_email);
  END IF;

  v_local := lower(split_part(v_email, '@', 1));
  SELECT * INTO v_pat FROM public.institution_email_patterns WHERE institution_id = _institution_id;
  IF FOUND THEN
    BEGIN
      IF v_pat.faculty_email_regex IS NOT NULL AND v_local ~* v_pat.faculty_email_regex THEN v_role := 'faculty'; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN
      IF v_role IS NULL AND v_pat.student_email_regex IS NOT NULL AND v_local ~* v_pat.student_email_regex THEN v_role := 'student'; END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
  IF v_role IS NULL THEN
    v_ambig := true;
    v_role := CASE WHEN v_local ~ '\d{6,}' THEN 'student' ELSE 'faculty' END;
  END IF;

  UPDATE public.profiles
     SET institution_id = _institution_id,
         institution_email = v_email,
         institution_role = v_role,
         institution_verified_at = COALESCE(institution_verified_at, now()),
         updated_at = now()
   WHERE id = uid;

  RETURN jsonb_build_object('ok', true,
    'institution_id', _institution_id,
    'institution_name', v_inst.name,
    'email', v_email,
    'role', v_role,
    'ambiguous', v_ambig);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.link_institution_membership(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.link_institution_membership(uuid) TO authenticated, service_role;

-- ===========================================================================
-- 2. CONNECTION REQUESTS: prevent requester self-approval.
-- ===========================================================================
DROP POLICY IF EXISTS "participants can update" ON public.connection_requests;

-- Recipients may accept/decline (set any status).
CREATE POLICY "recipient can respond"
  ON public.connection_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Requesters may only withdraw to 'dismissed' (cancel). They cannot accept.
CREATE POLICY "requester can withdraw"
  ON public.connection_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id AND status = 'dismissed');

-- Note: like_to_connect / pass_on_maker run as SECURITY DEFINER and continue to
-- work because they bypass these policies.

-- ===========================================================================
-- 3. REALTIME BROADCAST CHANNELS: explicit deny-all (app uses postgres_changes).
-- ===========================================================================
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "broadcast disabled" ON realtime.messages';
  EXECUTE 'CREATE POLICY "broadcast disabled" ON realtime.messages
           FOR ALL TO authenticated, anon
           USING (false) WITH CHECK (false)';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'cannot manage realtime.messages policies — skipping';
END $$;

-- ===========================================================================
-- 4. AVATARS BUCKET: owner-scoped write, public read.
-- ===========================================================================
DROP POLICY IF EXISTS "avatars read" ON storage.objects;
DROP POLICY IF EXISTS "avatars owner insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars owner update" ON storage.objects;
DROP POLICY IF EXISTS "avatars owner delete" ON storage.objects;

CREATE POLICY "avatars read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars owner insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars owner update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===========================================================================
-- 5. EXTENSIONS: move pg_trgm out of public.
-- (vector stays in public — moving it would break the embedding columns.)
-- ===========================================================================
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
DO $$
BEGIN
  ALTER EXTENSION pg_trgm SET SCHEMA extensions;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_trgm move skipped: %', SQLERRM;
END $$;

-- ===========================================================================
-- 6. SECURITY DEFINER hygiene: revoke EXECUTE from anon on functions that
--    don't need to be callable before sign-in.
-- ===========================================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.prosecdef = true
       AND p.proname NOT IN ('check_username_available', 'profile_id_by_username',
                             'get_class_invite_for_acceptance')
  LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon, PUBLIC',
                     r.nspname, r.proname, r.args);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;
