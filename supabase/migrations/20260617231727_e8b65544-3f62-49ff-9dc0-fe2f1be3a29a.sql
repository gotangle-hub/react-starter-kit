CREATE OR REPLACE FUNCTION public.get_auth_methods(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_has_password boolean := false;
  v_providers text[] := ARRAY[]::text[];
BEGIN
  SELECT id, (encrypted_password IS NOT NULL AND length(encrypted_password) > 0)
    INTO v_user_id, v_has_password
  FROM auth.users
  WHERE lower(email) = lower(p_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('exists', false, 'has_password', false, 'providers', '[]'::jsonb);
  END IF;

  SELECT COALESCE(array_agg(DISTINCT provider), ARRAY[]::text[])
    INTO v_providers
  FROM auth.identities
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'exists', true,
    'has_password', v_has_password,
    'providers', to_jsonb(v_providers)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_auth_methods(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_methods(text) TO service_role;