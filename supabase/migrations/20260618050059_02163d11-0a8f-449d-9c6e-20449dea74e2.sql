
-- 1. Profile columns for verified campus membership.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS institution_role text CHECK (institution_role IN ('faculty','student')),
  ADD COLUMN IF NOT EXISTS institution_email text,
  ADD COLUMN IF NOT EXISTS institution_verified_at timestamptz;

CREATE INDEX IF NOT EXISTS profiles_institution_idx ON public.profiles (institution_id);

-- 2. Security-definer RPC that verifies the caller's auth email against the
--    chosen institution and persists the link + detected role on profiles.
CREATE OR REPLACE FUNCTION public.link_institution_membership(_institution_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  user_email text;
  email_domain text;
  email_local text;
  inst public.institutions%ROWTYPE;
  fac_re text;
  stu_re text;
  detected text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = uid;
  IF user_email IS NULL OR position('@' in user_email) = 0 THEN
    RAISE EXCEPTION 'no verified email on account';
  END IF;
  email_domain := lower(split_part(user_email, '@', 2));
  email_local  := lower(split_part(user_email, '@', 1));

  SELECT * INTO inst FROM public.institutions WHERE id = _institution_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'institution not found';
  END IF;

  IF lower(inst.domain) <> email_domain
     AND NOT (email_domain = ANY (SELECT lower(unnest(inst.alt_domains)))) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'domain_mismatch',
      'expected_domain', inst.domain,
      'email', user_email
    );
  END IF;

  fac_re := inst.faculty_email_regex;
  stu_re := inst.student_email_regex;
  detected := NULL;
  IF fac_re IS NOT NULL AND email_local ~* fac_re THEN
    detected := 'faculty';
  ELSIF stu_re IS NOT NULL AND email_local ~* stu_re THEN
    detected := 'student';
  ELSIF fac_re IS NULL AND stu_re IS NULL THEN
    -- Sensible default when the institution hasn't configured rules:
    -- a local-part containing 6+ consecutive digits is treated as a student id.
    IF email_local ~ '\d{6,}' THEN detected := 'student'; ELSE detected := 'faculty'; END IF;
  END IF;

  -- If still ambiguous (one regex set but didn't match), surface that to the UI
  -- so the user can pick — we will still record the institution link.
  UPDATE public.profiles
     SET institution_id = inst.id,
         institution_email = user_email,
         institution_role = COALESCE(detected, institution_role),
         institution_verified_at = now(),
         updated_at = now()
   WHERE id = uid;

  RETURN jsonb_build_object(
    'ok', true,
    'institution_id', inst.id,
    'institution_name', inst.name,
    'email', user_email,
    'role', detected,
    'ambiguous', detected IS NULL
  );
END;
$$;

REVOKE ALL ON FUNCTION public.link_institution_membership(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.link_institution_membership(uuid) TO authenticated;

-- 3. Companion RPC: caller confirms their role when detection was ambiguous.
CREATE OR REPLACE FUNCTION public.set_institution_role(_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _role NOT IN ('faculty','student') THEN RAISE EXCEPTION 'invalid role'; END IF;
  UPDATE public.profiles
     SET institution_role = _role, updated_at = now()
   WHERE id = auth.uid() AND institution_verified_at IS NOT NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.set_institution_role(text) FROM public;
GRANT EXECUTE ON FUNCTION public.set_institution_role(text) TO authenticated;
