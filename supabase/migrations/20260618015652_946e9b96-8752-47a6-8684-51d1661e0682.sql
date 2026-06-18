
-- Enum for boost kind & status
DO $$ BEGIN
  CREATE TYPE public.boost_kind AS ENUM ('profile','post','callout','community','creator');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.boost_status AS ENUM ('pending','active','ended','failed','canceled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. boosts
CREATE TABLE IF NOT EXISTS public.boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.boost_kind NOT NULL,
  target_id uuid,
  product_id text NOT NULL,
  product_name text NOT NULL,
  audience text NOT NULL DEFAULT 'Everyone',
  duration_days int NOT NULL DEFAULT 7,
  daily_budget_minor int NOT NULL DEFAULT 0,
  total_minor int NOT NULL,
  currency text NOT NULL DEFAULT 'AED',
  status public.boost_status NOT NULL DEFAULT 'pending',
  ziina_intent_id text UNIQUE,
  starts_at timestamptz,
  ends_at timestamptz,
  impressions int NOT NULL DEFAULT 0,
  clicks int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.boosts TO authenticated;
GRANT ALL ON public.boosts TO service_role;

ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their boosts"
  ON public.boosts FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create boosts"
  ON public.boosts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their boosts"
  ON public.boosts FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_boosts_active
  ON public.boosts (status, ends_at)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_boosts_owner
  ON public.boosts (owner_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.touch_boosts_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_touch_boosts ON public.boosts;
CREATE TRIGGER trg_touch_boosts BEFORE UPDATE ON public.boosts
FOR EACH ROW EXECUTE FUNCTION public.touch_boosts_updated_at();

-- 2. boost_impressions (reach log)
CREATE TABLE IF NOT EXISTS public.boost_impressions (
  id bigserial PRIMARY KEY,
  boost_id uuid NOT NULL REFERENCES public.boosts(id) ON DELETE CASCADE,
  viewer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.boost_impressions TO authenticated;
GRANT ALL ON public.boost_impressions TO service_role;

ALTER TABLE public.boost_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their boost impressions"
  ON public.boost_impressions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.boosts b WHERE b.id = boost_impressions.boost_id AND b.owner_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_boost_impressions_boost
  ON public.boost_impressions (boost_id, created_at DESC);

-- 3. End expired boosts
CREATE OR REPLACE FUNCTION public.expire_finished_boosts()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.boosts SET status = 'ended'
  WHERE status = 'active' AND ends_at IS NOT NULL AND ends_at < now();
$$;

-- 4. Activate a boost when payment is verified (called by edge function w/ service role)
CREATE OR REPLACE FUNCTION public.activate_boost_by_intent(_intent_id text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_boost public.boosts%ROWTYPE;
BEGIN
  SELECT * INTO v_boost FROM public.boosts WHERE ziina_intent_id = _intent_id;
  IF v_boost.id IS NULL THEN RETURN NULL; END IF;
  IF v_boost.status IN ('active','ended') THEN RETURN v_boost.id; END IF;
  UPDATE public.boosts
     SET status = 'active',
         starts_at = COALESCE(starts_at, now()),
         ends_at = COALESCE(ends_at, now() + (v_boost.duration_days || ' days')::interval)
   WHERE id = v_boost.id;
  RETURN v_boost.id;
END $$;

CREATE OR REPLACE FUNCTION public.fail_boost_by_intent(_intent_id text, _status public.boost_status)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.boosts SET status = _status
  WHERE ziina_intent_id = _intent_id AND status = 'pending';
$$;

-- 5. Active boosted post ids (used by feed ranker to mark / inject promoted items)
CREATE OR REPLACE FUNCTION public.list_active_boosted_post_ids()
RETURNS TABLE(post_id uuid, boost_id uuid, owner_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.target_id AS post_id, b.id, b.owner_id
  FROM public.boosts b
  WHERE b.status = 'active'
    AND b.kind IN ('post','community','callout')
    AND b.target_id IS NOT NULL
    AND (b.ends_at IS NULL OR b.ends_at > now());
$$;

CREATE OR REPLACE FUNCTION public.list_active_boosted_creator_ids()
RETURNS TABLE(owner_id uuid, boost_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.owner_id, b.id
  FROM public.boosts b
  WHERE b.status = 'active'
    AND b.kind IN ('profile','creator')
    AND (b.ends_at IS NULL OR b.ends_at > now());
$$;

-- 6. Record impressions (atomic increment + log row)
CREATE OR REPLACE FUNCTION public.record_boost_impressions(_boost_ids uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_id uuid;
BEGIN
  IF _boost_ids IS NULL THEN RETURN; END IF;
  FOREACH v_id IN ARRAY _boost_ids LOOP
    INSERT INTO public.boost_impressions (boost_id, viewer_id) VALUES (v_id, v_uid);
    UPDATE public.boosts SET impressions = impressions + 1 WHERE id = v_id AND status = 'active';
  END LOOP;
END $$;

-- 7. Reach stats for an owner's boost
CREATE OR REPLACE FUNCTION public.boost_reach_stats(_boost_id uuid)
RETURNS TABLE(impressions int, unique_viewers int, started_at timestamptz, ends_at timestamptz, status public.boost_status)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT b.impressions,
         (SELECT count(DISTINCT viewer_id)::int FROM public.boost_impressions WHERE boost_id = b.id AND viewer_id IS NOT NULL),
         b.starts_at, b.ends_at, b.status
  FROM public.boosts b
  WHERE b.id = _boost_id AND b.owner_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_latest_boost()
RETURNS public.boosts LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.boosts WHERE owner_id = auth.uid()
  ORDER BY created_at DESC LIMIT 1;
$$;
