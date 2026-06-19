
-- ============================================================
-- 1. Profile fields for matching
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS open_to_collaborate boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';

-- ============================================================
-- 2. match_preferences — persisted per user
-- ============================================================
CREATE TABLE IF NOT EXISTS public.match_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  intent text NOT NULL DEFAULT 'connection',           -- 'connection' | 'collaboration'
  disciplines text[] NOT NULL DEFAULT '{}',
  location text,
  availability text,
  experience_level text,
  account_types text[] NOT NULL DEFAULT '{}',          -- 'designer','studio'
  recency_days int,                                    -- null = any
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_preferences TO authenticated;
GRANT ALL ON public.match_preferences TO service_role;
ALTER TABLE public.match_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "match_prefs own" ON public.match_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. swipe_counts — server-side daily cap
-- ============================================================
CREATE TABLE IF NOT EXISTS public.swipe_counts (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
GRANT SELECT ON public.swipe_counts TO authenticated;
GRANT ALL ON public.swipe_counts TO service_role;
ALTER TABLE public.swipe_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "swipe_counts read own" ON public.swipe_counts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 4. is_unlimited_account — pro OR studio = unlimited
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_unlimited_account(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT plan = 'pro' OR account_type::text = 'studio'
       FROM public.profiles WHERE id = _uid),
    false);
$$;
REVOKE EXECUTE ON FUNCTION public.is_unlimited_account(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_unlimited_account(uuid) TO authenticated;

-- ============================================================
-- 5. user_is_collab_seeking — derive collab intent
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_is_collab_seeking(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE((SELECT open_to_collaborate FROM public.profiles WHERE id = _uid), false)
    OR EXISTS (SELECT 1 FROM public.competition_user_state
                WHERE user_id = _uid AND interested = true)
    OR EXISTS (SELECT 1 FROM public.posts
                WHERE author_id = _uid
                  AND (caption ILIKE '%collab%' OR title ILIKE '%collab%' OR 'collab' = ANY(tags) OR 'collaboration' = ANY(tags)));
$$;
REVOKE EXECUTE ON FUNCTION public.user_is_collab_seeking(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_is_collab_seeking(uuid) TO authenticated;

-- ============================================================
-- 6. get_match_deck — returns work posts for the swipe deck
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_match_deck(
  _intent text DEFAULT 'connection',
  _disciplines text[] DEFAULT '{}',
  _location text DEFAULT NULL,
  _availability text DEFAULT NULL,
  _experience text DEFAULT NULL,
  _account_types text[] DEFAULT '{}',
  _recency_days int DEFAULT NULL,
  _limit int DEFAULT 40
) RETURNS TABLE(
  post_id uuid,
  title text,
  caption text,
  media_paths text[],
  image_path text,
  category text,
  created_at timestamptz,
  author_id uuid,
  author_name text,
  author_username text,
  author_avatar_path text,
  author_account_type text,
  author_verified boolean,
  author_location text,
  author_disciplines text[]
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    p.id, p.title, p.caption, p.media_paths, p.image_path, p.category, p.created_at,
    pr.id, COALESCE(pr.display_name, pr.username), pr.username, pr.avatar_path,
    pr.account_type::text, (pr.verified_at IS NOT NULL),
    pr.location, pr.disciplines
  FROM public.posts p
  JOIN public.profiles pr ON pr.id = p.author_id
  WHERE p.author_id <> COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    AND p.on_explore = true
    AND (COALESCE(array_length(p.media_paths,1),0) > 0 OR p.image_path IS NOT NULL)
    AND (_intent <> 'collaboration' OR public.user_is_collab_seeking(pr.id))
    AND (COALESCE(array_length(_disciplines,1),0) = 0 OR pr.disciplines && _disciplines)
    AND (_location IS NULL OR _location = '' OR pr.location ILIKE '%' || _location || '%')
    AND (_availability IS NULL OR _availability = '' OR pr.availability = _availability)
    AND (_experience  IS NULL OR _experience  = '' OR pr.experience_level = _experience)
    AND (COALESCE(array_length(_account_types,1),0) = 0 OR pr.account_type::text = ANY(_account_types))
    AND (_recency_days IS NULL OR p.created_at >= now() - (_recency_days || ' days')::interval)
    AND NOT EXISTS (
      SELECT 1 FROM public.connection_requests cr
      WHERE cr.requester_id = auth.uid() AND cr.recipient_id = pr.id
    )
  ORDER BY p.created_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
$$;
REVOKE EXECUTE ON FUNCTION public.get_match_deck(text,text[],text,text,text,text[],int,int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_match_deck(text,text[],text,text,text,text[],int,int) TO authenticated;

-- ============================================================
-- 7. count_active_collaborations_owned — for the 2-cap rule
-- ============================================================
CREATE OR REPLACE FUNCTION public.count_active_collaborations_owned(_uid uuid)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*)::int FROM public.collaborations c
  WHERE c.owner_id = _uid;
$$;
REVOKE EXECUTE ON FUNCTION public.count_active_collaborations_owned(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.count_active_collaborations_owned(uuid) TO authenticated;

-- ============================================================
-- 8. register_swipe — server-side cap + side effect
-- ============================================================
CREATE OR REPLACE FUNCTION public.register_swipe(
  _target_user_id uuid,
  _intent text,
  _post_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_unlimited boolean;
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_count int;
  v_cap int := 15;
  v_collab uuid;
  v_active int;
  v_status text;
  v_mutual boolean;
  v_title text;
BEGIN
  IF v_me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _target_user_id IS NULL OR _target_user_id = v_me THEN
    RAISE EXCEPTION 'invalid target';
  END IF;
  IF _intent NOT IN ('connection','collaboration') THEN
    RAISE EXCEPTION 'invalid intent';
  END IF;

  v_unlimited := public.is_unlimited_account(v_me);

  -- Daily cap (free designer only)
  IF NOT v_unlimited THEN
    INSERT INTO public.swipe_counts(user_id, day, count)
    VALUES (v_me, v_today, 0)
    ON CONFLICT (user_id, day) DO NOTHING;
    SELECT count INTO v_count FROM public.swipe_counts
      WHERE user_id = v_me AND day = v_today FOR UPDATE;
    IF v_count >= v_cap THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'cap_reached', 'cap', v_cap, 'remaining', 0);
    END IF;
  END IF;

  IF _intent = 'collaboration' THEN
    -- Free designer collaboration cap: 2 active
    IF NOT v_unlimited
       AND (SELECT account_type::text FROM public.profiles WHERE id = v_me) = 'designer' THEN
      v_active := public.count_active_collaborations_owned(v_me);
      IF v_active >= 2 THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'collab_cap_reached', 'cap', 2);
      END IF;
    END IF;

    SELECT COALESCE(display_name, username, 'maker') INTO v_title
      FROM public.profiles WHERE id = _target_user_id;
    v_collab := public.create_collaboration(
      'Collaboration with ' || v_title, '', ARRAY[_target_user_id]::uuid[]);
    v_status := 'invited';
    v_mutual := false;
  ELSE
    -- Connection intent
    SELECT r.status, r.mutual INTO v_status, v_mutual
      FROM public.like_to_connect(_target_user_id) r;
  END IF;

  -- Increment count after success
  IF NOT v_unlimited THEN
    UPDATE public.swipe_counts SET count = count + 1
      WHERE user_id = v_me AND day = v_today;
    SELECT count INTO v_count FROM public.swipe_counts
      WHERE user_id = v_me AND day = v_today;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'status', v_status,
    'mutual', COALESCE(v_mutual, false),
    'collab_id', v_collab,
    'cap', CASE WHEN v_unlimited THEN NULL ELSE v_cap END,
    'remaining', CASE WHEN v_unlimited THEN NULL ELSE GREATEST(0, v_cap - COALESCE(v_count,0)) END,
    'unlimited', v_unlimited
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.register_swipe(uuid,text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_swipe(uuid,text,uuid) TO authenticated;

-- ============================================================
-- 9. get_swipe_state — for UI meter
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_swipe_state()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := auth.uid();
  v_unlimited boolean;
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_count int := 0;
  v_cap int := 15;
BEGIN
  IF v_me IS NULL THEN RETURN jsonb_build_object('unlimited', false, 'cap', v_cap, 'remaining', v_cap); END IF;
  v_unlimited := public.is_unlimited_account(v_me);
  SELECT count INTO v_count FROM public.swipe_counts
    WHERE user_id = v_me AND day = v_today;
  RETURN jsonb_build_object(
    'unlimited', v_unlimited,
    'cap', CASE WHEN v_unlimited THEN NULL ELSE v_cap END,
    'used', COALESCE(v_count,0),
    'remaining', CASE WHEN v_unlimited THEN NULL ELSE GREATEST(0, v_cap - COALESCE(v_count,0)) END
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.get_swipe_state() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_swipe_state() TO authenticated;
