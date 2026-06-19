
-- 1. client_briefs table
CREATE TABLE public.client_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  brief_type text,
  disciplines text[] NOT NULL DEFAULT '{}',
  description text,
  scope text,
  budget_text text,
  timeline text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX client_briefs_client_created_idx ON public.client_briefs (client_id, created_at DESC);
CREATE INDEX client_briefs_open_idx ON public.client_briefs (created_at DESC) WHERE status = 'open';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_briefs TO authenticated;
GRANT ALL ON public.client_briefs TO service_role;

ALTER TABLE public.client_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients manage their own briefs"
  ON public.client_briefs FOR ALL TO authenticated
  USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);

CREATE POLICY "authenticated can read open briefs"
  ON public.client_briefs FOR SELECT TO authenticated
  USING (status = 'open');

CREATE TRIGGER client_briefs_touch
  BEFORE UPDATE ON public.client_briefs
  FOR EACH ROW EXECUTE FUNCTION public.touch_idv_updated_at();

-- 2. profiles columns for practice
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS practice_tz text,
  ADD COLUMN IF NOT EXISTS practice_reward_granted_at timestamptz;

-- 3. nudges dedupe
CREATE TABLE public.practice_nudges (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_date date NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, local_date)
);
GRANT SELECT ON public.practice_nudges TO authenticated;
GRANT ALL ON public.practice_nudges TO service_role;
ALTER TABLE public.practice_nudges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own nudges" ON public.practice_nudges
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 4. status RPC
CREATE OR REPLACE FUNCTION public.get_practice_status()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_acct text;
  v_plan text;
  v_tz text;
  v_granted timestamptz;
  v_today date;
  v_streak int := 0;
  v_today_done boolean := false;
  v_kind text;
  v_active boolean := false;
  v_count int := 0;
  v_window_start date;
  v_days_left int;
  v_done_dates date[] := ARRAY[]::date[];
  v_brief_rows jsonb := '[]'::jsonb;
BEGIN
  IF v_me IS NULL THEN RETURN jsonb_build_object('ok', false); END IF;
  SELECT account_type::text, plan, practice_tz, practice_reward_granted_at
    INTO v_acct, v_plan, v_tz, v_granted
    FROM public.profiles WHERE id = v_me;

  IF v_acct = 'designer' AND v_plan = 'free' THEN
    v_kind := 'designer';
    v_active := v_granted IS NULL;
  ELSIF v_acct = 'client' AND v_plan = 'free' THEN
    v_kind := 'client';
    v_active := v_granted IS NULL;
  ELSE
    RETURN jsonb_build_object('ok', true, 'kind', null, 'eligible', false);
  END IF;

  v_tz := COALESCE(v_tz, 'UTC');
  v_today := (now() AT TIME ZONE v_tz)::date;

  IF v_kind = 'designer' THEN
    -- distinct qualifying days from posts
    SELECT COALESCE(array_agg(d ORDER BY d DESC), ARRAY[]::date[])
      INTO v_done_dates
    FROM (
      SELECT DISTINCT ((created_at AT TIME ZONE v_tz)::date) AS d
      FROM public.posts
      WHERE author_id = v_me
        AND created_at >= now() - interval '40 days'
    ) s
    WHERE d <= v_today;

    -- compute current streak walking back from today (or yesterday)
    DECLARE
      v_cursor date := v_today;
      v_anchor date;
    BEGIN
      IF v_done_dates IS NULL OR array_length(v_done_dates,1) IS NULL THEN
        v_streak := 0;
      ELSE
        v_anchor := v_done_dates[1];
        IF v_anchor = v_today THEN
          v_today_done := true;
          v_cursor := v_today;
        ELSIF v_anchor = v_today - 1 THEN
          v_cursor := v_today - 1;
        ELSE
          v_streak := 0;
          v_cursor := NULL;
        END IF;
        IF v_cursor IS NOT NULL THEN
          FOR i IN 1..array_length(v_done_dates,1) LOOP
            IF v_done_dates[i] = v_cursor THEN
              v_streak := v_streak + 1;
              v_cursor := v_cursor - 1;
            ELSIF v_done_dates[i] < v_cursor THEN
              EXIT;
            END IF;
          END LOOP;
        END IF;
      END IF;
    END;

    RETURN jsonb_build_object(
      'ok', true,
      'kind', 'designer',
      'eligible', v_active,
      'tz', v_tz,
      'today', v_today,
      'streak', v_streak,
      'goal', 10,
      'today_done', v_today_done,
      'granted_at', v_granted,
      'recent_days', to_jsonb(v_done_dates[1:10])
    );

  ELSE -- client
    SELECT MIN((created_at AT TIME ZONE v_tz)::date)
      INTO v_window_start
    FROM public.client_briefs
    WHERE client_id = v_me
      AND created_at >= now() - interval '20 days';

    IF v_window_start IS NULL THEN
      v_count := 0;
      v_days_left := 10;
    ELSE
      IF v_today > v_window_start + 9 THEN
        -- window expired with no grant; reset by ignoring old briefs
        SELECT MIN((created_at AT TIME ZONE v_tz)::date)
          INTO v_window_start
          FROM public.client_briefs
          WHERE client_id = v_me
            AND (created_at AT TIME ZONE v_tz)::date > v_today - 10;
        IF v_window_start IS NULL THEN
          v_count := 0; v_days_left := 10;
        END IF;
      END IF;
      IF v_window_start IS NOT NULL THEN
        SELECT count(*), jsonb_agg(jsonb_build_object(
          'id', id, 'title', title,
          'day', ((created_at AT TIME ZONE v_tz)::date - v_window_start) + 1,
          'created_at', created_at
        ) ORDER BY created_at)
          INTO v_count, v_brief_rows
          FROM public.client_briefs
         WHERE client_id = v_me
           AND (created_at AT TIME ZONE v_tz)::date BETWEEN v_window_start AND v_window_start + 9;
        v_days_left := GREATEST(0, (v_window_start + 9) - v_today + 1);
      END IF;
    END IF;

    RETURN jsonb_build_object(
      'ok', true,
      'kind', 'client',
      'eligible', v_active,
      'tz', v_tz,
      'today', v_today,
      'count', COALESCE(v_count,0),
      'goal', 3,
      'window_start', v_window_start,
      'days_left', COALESCE(v_days_left, 10),
      'briefs', COALESCE(v_brief_rows, '[]'::jsonb),
      'granted_at', v_granted
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_practice_status() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_practice_status() FROM anon;

-- 5. record event RPC — sets tz, evaluates, grants
CREATE OR REPLACE FUNCTION public.record_practice_event(_tz text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_acct text;
  v_plan text;
  v_tz text;
  v_granted timestamptz;
  v_status jsonb;
  v_grant boolean := false;
BEGIN
  IF v_me IS NULL THEN RETURN jsonb_build_object('ok', false); END IF;

  -- set practice_tz on first action if not already
  SELECT account_type::text, plan, practice_tz, practice_reward_granted_at
    INTO v_acct, v_plan, v_tz, v_granted
    FROM public.profiles WHERE id = v_me;

  IF v_tz IS NULL AND _tz IS NOT NULL AND _tz ~ '^[A-Za-z_]+/[A-Za-z_]+' THEN
    UPDATE public.profiles SET practice_tz = _tz, updated_at = now()
      WHERE id = v_me AND practice_tz IS NULL;
  END IF;

  v_status := public.get_practice_status();

  IF v_granted IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'granted_now', false, 'status', v_status);
  END IF;

  IF (v_status->>'kind') = 'designer'
     AND COALESCE((v_status->>'streak')::int, 0) >= 10 THEN
    v_grant := true;
  ELSIF (v_status->>'kind') = 'client'
     AND COALESCE((v_status->>'count')::int, 0) >= 3 THEN
    v_grant := true;
  END IF;

  IF v_grant THEN
    UPDATE public.profiles
      SET plan = 'pro',
          practice_reward_granted_at = now(),
          updated_at = now()
      WHERE id = v_me;

    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (v_me, 'practice_reward', v_me, 'user', v_me::text,
            CASE WHEN (v_status->>'kind') = 'client'
                 THEN 'You unlocked a month of Client Pro'
                 ELSE 'You unlocked a month of Tangle Pro' END);

    v_status := public.get_practice_status();
    RETURN jsonb_build_object('ok', true, 'granted_now', true, 'status', v_status);
  END IF;

  RETURN jsonb_build_object('ok', true, 'granted_now', false, 'status', v_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_practice_event(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.record_practice_event(text) FROM anon;

-- 6. Triggers to auto-record on posts (designer) and client_briefs (client)
CREATE OR REPLACE FUNCTION public.tg_practice_on_post()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_acct text; v_plan text; v_granted timestamptz; v_status jsonb;
BEGIN
  SELECT account_type::text, plan, practice_reward_granted_at
    INTO v_acct, v_plan, v_granted
    FROM public.profiles WHERE id = NEW.author_id;
  IF v_acct <> 'designer' OR v_plan <> 'free' OR v_granted IS NOT NULL THEN
    RETURN NEW;
  END IF;
  -- evaluate via the status function under the author's identity is fine
  -- but get_practice_status uses auth.uid(); we replicate inline.
  PERFORM public._practice_eval_and_grant(NEW.author_id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_practice_on_brief()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_acct text; v_plan text; v_granted timestamptz;
BEGIN
  SELECT account_type::text, plan, practice_reward_granted_at
    INTO v_acct, v_plan, v_granted
    FROM public.profiles WHERE id = NEW.client_id;
  IF v_acct <> 'client' OR v_plan <> 'free' OR v_granted IS NOT NULL THEN
    RETURN NEW;
  END IF;
  PERFORM public._practice_eval_and_grant(NEW.client_id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;

-- inline evaluator that doesn't depend on auth.uid()
CREATE OR REPLACE FUNCTION public._practice_eval_and_grant(_uid uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_acct text; v_plan text; v_tz text; v_granted timestamptz;
  v_today date; v_streak int := 0; v_count int := 0;
  v_done_dates date[]; v_window_start date; v_grant boolean := false;
  v_cursor date; v_anchor date;
BEGIN
  SELECT account_type::text, plan, practice_tz, practice_reward_granted_at
    INTO v_acct, v_plan, v_tz, v_granted
    FROM public.profiles WHERE id = _uid;
  IF v_granted IS NOT NULL THEN RETURN; END IF;
  v_tz := COALESCE(v_tz, 'UTC');
  v_today := (now() AT TIME ZONE v_tz)::date;

  IF v_acct = 'designer' AND v_plan = 'free' THEN
    SELECT COALESCE(array_agg(d ORDER BY d DESC), ARRAY[]::date[]) INTO v_done_dates
    FROM (
      SELECT DISTINCT ((created_at AT TIME ZONE v_tz)::date) AS d
      FROM public.posts WHERE author_id = _uid
        AND created_at >= now() - interval '40 days'
    ) s WHERE d <= v_today;

    IF array_length(v_done_dates,1) IS NOT NULL THEN
      v_anchor := v_done_dates[1];
      IF v_anchor = v_today THEN v_cursor := v_today;
      ELSIF v_anchor = v_today - 1 THEN v_cursor := v_today - 1;
      ELSE v_cursor := NULL; END IF;
      IF v_cursor IS NOT NULL THEN
        FOR i IN 1..array_length(v_done_dates,1) LOOP
          IF v_done_dates[i] = v_cursor THEN
            v_streak := v_streak + 1;
            v_cursor := v_cursor - 1;
          ELSIF v_done_dates[i] < v_cursor THEN EXIT;
          END IF;
        END LOOP;
      END IF;
    END IF;
    IF v_streak >= 10 THEN v_grant := true; END IF;

  ELSIF v_acct = 'client' AND v_plan = 'free' THEN
    SELECT MIN((created_at AT TIME ZONE v_tz)::date) INTO v_window_start
      FROM public.client_briefs
      WHERE client_id = _uid
        AND (created_at AT TIME ZONE v_tz)::date > v_today - 10;
    IF v_window_start IS NOT NULL THEN
      SELECT count(*) INTO v_count
        FROM public.client_briefs
       WHERE client_id = _uid
         AND (created_at AT TIME ZONE v_tz)::date BETWEEN v_window_start AND v_window_start + 9;
      IF v_count >= 3 THEN v_grant := true; END IF;
    END IF;
  END IF;

  IF v_grant THEN
    UPDATE public.profiles
      SET plan = 'pro', practice_reward_granted_at = now(), updated_at = now()
      WHERE id = _uid AND practice_reward_granted_at IS NULL;
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (_uid, 'practice_reward', _uid, 'user', _uid::text,
            CASE WHEN v_acct = 'client' THEN 'You unlocked a month of Client Pro'
                 ELSE 'You unlocked a month of Tangle Pro' END);
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS practice_on_post_insert ON public.posts;
CREATE TRIGGER practice_on_post_insert
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_practice_on_post();

DROP TRIGGER IF EXISTS practice_on_brief_insert ON public.client_briefs;
CREATE TRIGGER practice_on_brief_insert
  AFTER INSERT ON public.client_briefs
  FOR EACH ROW EXECUTE FUNCTION public.tg_practice_on_brief();

-- 7. Cron nudge: hourly scan, find eligible users at local 20h who haven't acted today and haven't been nudged today
CREATE OR REPLACE FUNCTION public.send_practice_nudges()
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r record; v_today date; v_acted boolean; v_sent int := 0;
BEGIN
  FOR r IN
    SELECT id, account_type::text AS acct, practice_tz
      FROM public.profiles
     WHERE plan = 'free'
       AND practice_reward_granted_at IS NULL
       AND practice_tz IS NOT NULL
       AND account_type::text IN ('designer','client')
       AND EXTRACT(HOUR FROM (now() AT TIME ZONE practice_tz)) = 20
  LOOP
    v_today := (now() AT TIME ZONE r.practice_tz)::date;
    IF EXISTS (SELECT 1 FROM public.practice_nudges WHERE user_id = r.id AND local_date = v_today) THEN
      CONTINUE;
    END IF;
    IF r.acct = 'designer' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.posts
         WHERE author_id = r.id
           AND (created_at AT TIME ZONE r.practice_tz)::date = v_today
      ) INTO v_acted;
      -- only nudge if there's already an active streak (i.e. acted yesterday)
      IF NOT v_acted AND EXISTS (
        SELECT 1 FROM public.posts
         WHERE author_id = r.id
           AND (created_at AT TIME ZONE r.practice_tz)::date = v_today - 1
      ) THEN
        INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
        VALUES (r.id, 'practice_nudge', r.id, 'user', r.id::text,
                'A few hours left to keep your daily practice going');
        INSERT INTO public.practice_nudges (user_id, local_date) VALUES (r.id, v_today)
          ON CONFLICT DO NOTHING;
        v_sent := v_sent + 1;
      END IF;
    ELSE -- client
      IF NOT EXISTS (
        SELECT 1 FROM public.client_briefs
         WHERE client_id = r.id
           AND (created_at AT TIME ZONE r.practice_tz)::date = v_today
      ) AND EXISTS (
        SELECT 1 FROM public.client_briefs
         WHERE client_id = r.id
           AND (created_at AT TIME ZONE r.practice_tz)::date > v_today - 10
      ) THEN
        INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
        VALUES (r.id, 'practice_nudge', r.id, 'user', r.id::text,
                'Post a brief today to keep your free-month progress');
        INSERT INTO public.practice_nudges (user_id, local_date) VALUES (r.id, v_today)
          ON CONFLICT DO NOTHING;
        v_sent := v_sent + 1;
      END IF;
    END IF;
  END LOOP;
  RETURN v_sent;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.send_practice_nudges() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_practice_nudges() TO service_role;

-- Schedule cron (pg_cron)
SELECT cron.schedule(
  'practice-nudges-hourly',
  '0 * * * *',
  $cron$ SELECT public.send_practice_nudges(); $cron$
);
