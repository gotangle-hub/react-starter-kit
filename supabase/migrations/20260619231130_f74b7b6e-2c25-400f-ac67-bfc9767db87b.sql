
-- Promo codes shared by many users
CREATE TABLE public.promo_codes (
  code text PRIMARY KEY,
  plan_target text NOT NULL,
  months int NOT NULL CHECK (months > 0),
  applies_to text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- No client write access. Reads allowed (validation), but redemption RPC is the only path that actually applies them.
CREATE POLICY "promo_codes_select_active" ON public.promo_codes
  FOR SELECT TO authenticated
  USING (active = true);

-- Redemption ledger — one per user, ever.
CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL REFERENCES public.promo_codes(code),
  granted_months int NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_redemptions TO authenticated;
GRANT ALL ON public.promo_redemptions TO service_role;

ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promo_redemptions_select_own" ON public.promo_redemptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Seed
INSERT INTO public.promo_codes (code, plan_target, months, applies_to, active) VALUES
  ('BASE39',    'designer_pro', 3, ARRAY['designer'], true),
  ('CAADGRADS', 'designer_pro', 2, ARRAY['designer'], true)
ON CONFLICT (code) DO NOTHING;

-- Pre-signup validation (returns ok + reason). SECURITY DEFINER so anon can call during signup.
CREATE OR REPLACE FUNCTION public.validate_promo_code(_code text, _account_type text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text := upper(btrim(coalesce(_code, '')));
  v_row public.promo_codes%ROWTYPE;
BEGIN
  IF v_code = '' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'empty');
  END IF;
  SELECT * INTO v_row FROM public.promo_codes WHERE code = v_code AND active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid',
      'message', 'That code isn''t valid.');
  END IF;
  IF _account_type IS NOT NULL
     AND array_length(v_row.applies_to, 1) IS NOT NULL
     AND NOT (_account_type = ANY(v_row.applies_to)) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_applicable',
      'message', 'This code is for ' || array_to_string(v_row.applies_to, ', ') || ' accounts.');
  END IF;
  RETURN jsonb_build_object('ok', true, 'code', v_code,
    'months', v_row.months, 'plan_target', v_row.plan_target);
END;
$$;

REVOKE ALL ON FUNCTION public.validate_promo_code(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.validate_promo_code(text, text) TO anon, authenticated;

-- Redeem inside handle_new_user (so it runs server-side on auth.users insert with no client trust).
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
  v_promo_raw text;
  v_promo text;
  v_promo_row public.promo_codes%ROWTYPE;
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

  -- Promo code redemption (silent: invalid/inapplicable codes are ignored so signup never blocks).
  v_promo_raw := NEW.raw_user_meta_data->>'referral_code';
  IF v_promo_raw IS NOT NULL THEN
    v_promo := upper(btrim(v_promo_raw));
    IF v_promo <> '' THEN
      SELECT * INTO v_promo_row FROM public.promo_codes WHERE code = v_promo AND active = true;
      IF FOUND
         AND (array_length(v_promo_row.applies_to, 1) IS NULL
              OR resolved::text = ANY(v_promo_row.applies_to))
         AND NOT EXISTS (SELECT 1 FROM public.promo_redemptions WHERE user_id = NEW.id) THEN
        UPDATE public.profiles
           SET plan = 'pro',
               plan_expires_at = GREATEST(now(), COALESCE(plan_expires_at, now()))
                                 + (v_promo_row.months || ' months')::interval,
               updated_at = now()
         WHERE id = NEW.id;
        INSERT INTO public.promo_redemptions (user_id, code, granted_months)
        VALUES (NEW.id, v_promo_row.code, v_promo_row.months)
        ON CONFLICT (user_id) DO NOTHING;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Stack practice reward on top of existing Pro time instead of replacing it.
CREATE OR REPLACE FUNCTION public.record_practice_event(_tz text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- One grant per account, ever.
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
    -- STACK: extend existing Pro time, never overwrite/shorten.
    UPDATE public.profiles
      SET plan = 'pro',
          plan_expires_at = GREATEST(now(), COALESCE(plan_expires_at, now())) + interval '30 days',
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
