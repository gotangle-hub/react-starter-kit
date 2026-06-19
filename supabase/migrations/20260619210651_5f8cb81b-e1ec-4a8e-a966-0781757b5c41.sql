
-- 1. Column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

COMMENT ON COLUMN public.profiles.plan_expires_at IS
  'Single source of truth for Pro expiry. NULL = non-expiring (paid). If in past, account is effectively free.';

-- 2. Read-time helper: effective plan
CREATE OR REPLACE FUNCTION public.effective_plan(_plan text, _expires timestamptz)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN _plan = 'pro' AND _expires IS NOT NULL AND _expires < now() THEN 'free'
    ELSE COALESCE(_plan, 'free')
  END;
$$;

GRANT EXECUTE ON FUNCTION public.effective_plan(text, timestamptz) TO authenticated, anon, service_role;

-- 3. Update practice grant logic — both grant sites — to set expiry.
CREATE OR REPLACE FUNCTION public.record_practice_event(_tz text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_me uuid := auth.uid();
  v_acct text;
  v_plan text;
  v_expires timestamptz;
  v_tz text;
  v_granted timestamptz;
  v_status jsonb;
  v_grant boolean := false;
BEGIN
  IF v_me IS NULL THEN RETURN jsonb_build_object('ok', false); END IF;

  SELECT account_type::text, plan, plan_expires_at, practice_tz, practice_reward_granted_at
    INTO v_acct, v_plan, v_expires, v_tz, v_granted
    FROM public.profiles WHERE id = v_me;

  IF v_tz IS NULL AND _tz IS NOT NULL AND _tz ~ '^[A-Za-z_]+/[A-Za-z_]+' THEN
    UPDATE public.profiles SET practice_tz = _tz, updated_at = now()
      WHERE id = v_me AND practice_tz IS NULL;
  END IF;

  v_status := public.get_practice_status();

  -- Idempotent: one grant per account ever.
  IF v_granted IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'granted_now', false, 'status', v_status);
  END IF;

  -- Eligibility uses effective plan (an expired Pro shouldn't auto-regrant though,
  -- because practice_reward_granted_at gate above already blocks any re-grant).
  IF public.effective_plan(v_plan, v_expires) <> 'free' THEN
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
          plan_expires_at = now() + interval '30 days',
          practice_reward_granted_at = now(),
          updated_at = now()
      WHERE id = v_me
        AND practice_reward_granted_at IS NULL;

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

-- Mirror in the trigger-side evaluator.
CREATE OR REPLACE FUNCTION public._practice_eval_and_grant(_uid uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_acct text; v_plan text; v_expires timestamptz; v_tz text; v_granted timestamptz;
  v_today date; v_streak int := 0; v_count int := 0;
  v_done_dates date[]; v_window_start date; v_grant boolean := false;
  v_cursor date; v_anchor date;
BEGIN
  SELECT account_type::text, plan, plan_expires_at, practice_tz, practice_reward_granted_at
    INTO v_acct, v_plan, v_expires, v_tz, v_granted
    FROM public.profiles WHERE id = _uid;
  IF v_granted IS NOT NULL THEN RETURN; END IF;
  IF public.effective_plan(v_plan, v_expires) <> 'free' THEN RETURN; END IF;
  v_tz := COALESCE(v_tz, 'UTC');
  v_today := (now() AT TIME ZONE v_tz)::date;

  IF v_acct = 'designer' THEN
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

  ELSIF v_acct = 'client' THEN
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
      SET plan = 'pro',
          plan_expires_at = now() + interval '30 days',
          practice_reward_granted_at = now(),
          updated_at = now()
      WHERE id = _uid AND practice_reward_granted_at IS NULL;
    INSERT INTO public.notifications (user_id, type, actor_id, target_kind, target_id, body)
    VALUES (_uid, 'practice_reward', _uid, 'user', _uid::text,
            CASE WHEN v_acct = 'client' THEN 'You unlocked a month of Client Pro'
                 ELSE 'You unlocked a month of Tangle Pro' END);
  END IF;
END;
$$;

-- 4. Cron worker: expire lapsed Pro accounts.
-- Paid Ziina subscriptions are represented by plan_expires_at IS NULL (non-expiring),
-- so this only touches rows with a real past expiry — paid accounts are left alone.
CREATE OR REPLACE FUNCTION public.expire_lapsed_plans()
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_n int;
BEGIN
  WITH upd AS (
    UPDATE public.profiles
       SET plan = 'free',
           plan_expires_at = NULL,
           updated_at = now()
     WHERE plan = 'pro'
       AND plan_expires_at IS NOT NULL
       AND plan_expires_at < now()
    RETURNING id
  )
  SELECT count(*) INTO v_n FROM upd;
  RETURN v_n;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.expire_lapsed_plans() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_lapsed_plans() TO service_role;

-- 5. One-time backfill: any account whose practice reward was granted before this
-- migration (plan='pro', practice_reward_granted_at set, plan_expires_at null)
-- gets a 30-day expiry counted from the original grant.
UPDATE public.profiles
   SET plan_expires_at = practice_reward_granted_at + interval '30 days'
 WHERE plan = 'pro'
   AND practice_reward_granted_at IS NOT NULL
   AND plan_expires_at IS NULL;

-- 6. Schedule the daily cron (pg_cron). Safe to re-run.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('expire-plans') WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'expire-plans'
    );
    PERFORM cron.schedule(
      'expire-plans',
      '17 3 * * *',  -- daily at 03:17 UTC
      $cron$ SELECT public.expire_lapsed_plans(); $cron$
    );
  END IF;
END $$;
