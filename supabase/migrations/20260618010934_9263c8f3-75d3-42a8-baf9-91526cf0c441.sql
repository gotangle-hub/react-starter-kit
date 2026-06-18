
-- 1) Column + indexes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

-- Format check (lowercase letters, digits, _ and .; 3–20)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format_chk;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format_chk
  CHECK (username IS NULL OR username ~ '^[a-z0-9_.]{3,20}$');

-- 2) Normalize trigger — always store lowercase, trimmed.
CREATE OR REPLACE FUNCTION public.normalize_profile_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    NEW.username := lower(btrim(NEW.username));
    IF NEW.username = '' THEN NEW.username := NULL; END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_normalize_username ON public.profiles;
CREATE TRIGGER profiles_normalize_username
BEFORE INSERT OR UPDATE OF username ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.normalize_profile_username();

-- 3) Backfill any existing profile without a username.
DO $$
DECLARE
  r record;
  base text;
  candidate text;
  n int;
BEGIN
  FOR r IN SELECT id, display_name FROM public.profiles WHERE username IS NULL LOOP
    base := lower(regexp_replace(coalesce(r.display_name, ''), '[^a-z0-9_.]+', '', 'gi'));
    base := substring(base from 1 for 16);
    IF base IS NULL OR length(base) < 3 THEN
      base := 'user_' || substring(replace(r.id::text, '-', '') from 1 for 6);
    END IF;
    candidate := base;
    n := 0;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
      n := n + 1;
      candidate := substring(base from 1 for 17) || lpad(n::text, 2, '0');
      EXIT WHEN n > 9999;
    END LOOP;
    UPDATE public.profiles SET username = candidate WHERE id = r.id;
  END LOOP;
END $$;

-- Enforce NOT NULL and unique (case-insensitive — values are normalized to lowercase).
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;
DROP INDEX IF EXISTS profiles_username_lower_uidx;
CREATE UNIQUE INDEX profiles_username_lower_uidx ON public.profiles (lower(username));

-- 4) handle_new_user — pick up `username` from metadata, fall back to safe auto.
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

  -- Resolve username from metadata (preferred) or derive from display_name / id.
  desired := lower(btrim(coalesce(NEW.raw_user_meta_data->>'username', '')));
  IF desired = '' OR desired !~ '^[a-z0-9_.]{3,20}$' THEN
    base := lower(regexp_replace(coalesce(NEW.raw_user_meta_data->>'display_name', ''), '[^a-z0-9_.]+', '', 'gi'));
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

-- 5) RPCs — availability + suggestions + lookup by handle.
CREATE OR REPLACE FUNCTION public.check_username_available(_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _name IS NOT NULL
    AND lower(btrim(_name)) ~ '^[a-z0-9_.]{3,20}$'
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE username = lower(btrim(_name))
    );
$$;

CREATE OR REPLACE FUNCTION public.suggest_usernames(_base text, _count int DEFAULT 5)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
  out text[] := '{}';
  candidate text;
  n int := 0;
  guard int := 0;
BEGIN
  base := lower(regexp_replace(coalesce(_base, ''), '[^a-z0-9_.]+', '', 'gi'));
  base := substring(base from 1 for 17);
  IF base IS NULL OR length(base) < 3 THEN base := 'user'; END IF;
  WHILE array_length(out, 1) IS NULL OR array_length(out, 1) < _count LOOP
    n := n + 1; guard := guard + 1;
    candidate := substring(base from 1 for 17) || lpad(n::text, 2, '0');
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) THEN
      out := array_append(out, candidate);
    END IF;
    EXIT WHEN guard > 200;
  END LOOP;
  RETURN out;
END;
$$;

-- Look up a profile id by handle (used to render /u/:username pages).
CREATE OR REPLACE FUNCTION public.profile_id_by_username(_name text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE username = lower(btrim(_name)) LIMIT 1;
$$;

-- 6) Mentions — notify @-tagged users on dm_messages + comments.
CREATE OR REPLACE FUNCTION public.notify_mentions_in_dm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  handle text;
  target_id uuid;
BEGIN
  FOR handle IN
    SELECT DISTINCT lower(m[1])
    FROM regexp_matches(NEW.body, '@([a-z0-9_.]{3,20})', 'g') AS m
  LOOP
    SELECT id INTO target_id FROM public.profiles WHERE username = handle;
    IF target_id IS NULL OR target_id = NEW.sender_id THEN CONTINUE; END IF;
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (target_id, 'mention', NEW.sender_id, 'conversation', NEW.conversation_id::text, 'mentioned you');
  END LOOP;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_mentions_in_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  handle text;
  target_id uuid;
BEGIN
  FOR handle IN
    SELECT DISTINCT lower(m[1])
    FROM regexp_matches(NEW.body, '@([a-z0-9_.]{3,20})', 'g') AS m
  LOOP
    SELECT id INTO target_id FROM public.profiles WHERE username = handle;
    IF target_id IS NULL OR target_id = NEW.author_id THEN CONTINUE; END IF;
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (target_id, 'mention', NEW.author_id, 'post', NEW.post_id::text, 'mentioned you in a comment');
  END LOOP;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dm_messages_mentions ON public.dm_messages;
CREATE TRIGGER dm_messages_mentions
AFTER INSERT ON public.dm_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_mentions_in_dm();

DROP TRIGGER IF EXISTS comments_mentions ON public.comments;
CREATE TRIGGER comments_mentions
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_mentions_in_comment();
