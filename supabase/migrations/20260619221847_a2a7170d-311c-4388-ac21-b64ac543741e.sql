
-- 1. class_invites: allow professors to delete (revoke) outstanding invites
CREATE POLICY "Professors can delete their class invites"
  ON public.class_invites
  FOR DELETE
  TO authenticated
  USING (public.is_class_professor(class_id, auth.uid()));

-- 2. institutions: stop exposing email-regex columns to clients.
-- Column-level grants: revoke the regex columns from anon/authenticated; keep all
-- other columns readable as before. service_role retains full access.
REVOKE SELECT ON public.institutions FROM anon, authenticated;

GRANT SELECT (
  id, slug, name, city, country, domain, alt_domains, sso_provider, tint, initials,
  created_at, updated_at
) ON public.institutions TO anon, authenticated;

-- Server-side role detection so the regex never leaves the database.
CREATE OR REPLACE FUNCTION public.detect_institution_role(_institution_id uuid, _email text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inst public.institutions%ROWTYPE;
  local_part text;
  fac_re text;
  stu_re text;
BEGIN
  IF _email IS NULL OR _institution_id IS NULL THEN RETURN 'student'; END IF;
  SELECT * INTO inst FROM public.institutions WHERE id = _institution_id;
  IF NOT FOUND THEN RETURN 'student'; END IF;
  local_part := lower(split_part(_email, '@', 1));
  fac_re := inst.faculty_email_regex;
  stu_re := inst.student_email_regex;
  BEGIN
    IF fac_re IS NOT NULL AND local_part ~* fac_re THEN RETURN 'faculty'; END IF;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    IF stu_re IS NOT NULL AND local_part ~* stu_re THEN RETURN 'student'; END IF;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  IF local_part ~ '\d{6,}' THEN RETURN 'student'; END IF;
  RETURN 'faculty';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.detect_institution_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.detect_institution_role(uuid, text) TO authenticated, service_role;
