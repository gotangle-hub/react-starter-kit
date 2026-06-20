ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format_chk;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format_chk
  CHECK (username IS NULL OR username ~ '^[a-z0-9_.-]{3,20}$');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_type text;
  resolved public.account_type;
  meta_disciplines text[];
  d text;
  desired text;
  base text;
  candidate text;
  n int;
BEGIN
  meta_type := NEW.raw_user_meta_data->>'account_type';
  IF meta_type IN ('designer','studio','client','institution','student','collector') THEN
    resolved := meta_type::public.account_type;
  ELSE
    resolved := 'designer';
  END IF;

  BEGIN
    SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'disciplines'))
    INTO meta_disciplines;
  EXCEPTION WHEN OTHERS THEN
    meta_disciplines := '{}';
  END;
  IF meta_disciplines IS NULL THEN meta_disciplines := '{}'; END IF;

  desired := lower(btrim(coalesce(NEW.raw_user_meta_data->>'username', '')));
  IF desired = '' OR desired !~ '^[a-z0-9_.-]{3,20}$' THEN
    base := lower(regexp_replace(coalesce(NEW.raw_user_meta_data->>'display_name', ''), '[^a-z0-9_.-]+', '', 'gi'));
    base := substring(base from 1 for 16);
    IF base IS NULL OR length(base) < 3 THEN
      base := 'user_' || substring(replace(NEW.id::text, '-', '') from 1 for 6);
    END IF;
    desired := base;
  END IF;

  candidate := desired;
  n := 0;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    n := n + 1;
    candidate := substring(desired from 1 for 17) || lpad(n::text, 2, '0');
    EXIT WHEN n > 9999;
  END LOOP;

  INSERT INTO public.profiles (id, account_type, display_name, disciplines, username)
  VALUES (
    NEW.id,
    resolved,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', NULL),
    meta_disciplines,
    candidate
  )
  ON CONFLICT (id) DO NOTHING;

  IF array_length(meta_disciplines, 1) IS NOT NULL THEN
    FOREACH d IN ARRAY meta_disciplines LOOP
      INSERT INTO public.user_interests (user_id, tag, weight)
      VALUES (NEW.id, d, 1)
      ON CONFLICT (user_id, tag) DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_username_available(_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _name IS NOT NULL
    AND lower(btrim(_name)) ~ '^[a-z0-9_.-]{3,20}$'
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE username = lower(btrim(_name))
    );
$$;

GRANT EXECUTE ON FUNCTION public.check_username_available(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;