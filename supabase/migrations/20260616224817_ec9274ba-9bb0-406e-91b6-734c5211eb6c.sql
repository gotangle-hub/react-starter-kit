
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reach_tier smallint NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.post_metrics (
  post_id text PRIMARY KEY,
  velocity real NOT NULL DEFAULT 0,
  score real NOT NULL DEFAULT 0,
  reach_tier smallint NOT NULL DEFAULT 0,
  audience_size integer NOT NULL DEFAULT 0,
  events_recent integer NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS post_metrics_tier_idx ON public.post_metrics(reach_tier DESC, score DESC);

GRANT SELECT ON public.post_metrics TO anon, authenticated;
GRANT ALL ON public.post_metrics TO service_role;
ALTER TABLE public.post_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_metrics public read" ON public.post_metrics FOR SELECT USING (true);

-- Compute one pass of velocity-based virality metrics.
-- Window: last 72h. Time-decay half-life: 6h (early acceleration matters most).
-- Velocity is normalised by sqrt(audience_size + 10) so posts from small
-- accounts can break out when their engagement rate is high, and large
-- accounts don't dominate just from baseline reach.
-- Reach tier thresholds are deliberately conservative — most posts stay at 0.
CREATE OR REPLACE FUNCTION public.refresh_post_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  HALF_LIFE_HOURS constant real := 6;
BEGIN
  WITH author_audience AS (
    SELECT p.id::text AS post_id, p.author_id,
           COALESCE((SELECT count(*) FROM follows f WHERE f.followee_id = p.author_id), 0) AS audience
    FROM posts p
  ),
  events AS (
    SELECT i.target_id AS post_id,
           SUM(
             CASE i.kind
               WHEN 'connect' THEN 4
               WHEN 'save' THEN 3
               WHEN 'pin' THEN 3
               WHEN 'like' THEN 2
               WHEN 'comment' THEN 2
               WHEN 'dwell' THEN 1
               WHEN 'view' THEN 0.4
               ELSE 1
             END
             * POWER(0.5, EXTRACT(EPOCH FROM (now() - i.created_at)) / 3600.0 / HALF_LIFE_HOURS)
           )::real AS velocity,
           COUNT(*)::int AS events_recent
    FROM interactions i
    WHERE i.target_kind = 'post'
      AND i.created_at > now() - interval '72 hours'
    GROUP BY i.target_id
  ),
  scored AS (
    SELECT e.post_id,
           e.velocity,
           COALESCE(a.audience, 0) AS audience,
           e.events_recent,
           (e.velocity / sqrt(COALESCE(a.audience, 0) + 10))::real AS score
    FROM events e
    LEFT JOIN author_audience a ON a.post_id = e.post_id
  ),
  tiered AS (
    SELECT post_id, velocity, audience, events_recent, score,
           CASE
             WHEN score >= 20 THEN 4
             WHEN score >= 10 THEN 3
             WHEN score >=  5 THEN 2
             WHEN score >=  2 THEN 1
             ELSE 0
           END::smallint AS reach_tier
    FROM scored
  )
  INSERT INTO post_metrics (post_id, velocity, score, reach_tier, audience_size, events_recent, computed_at)
  SELECT post_id, velocity, score, reach_tier, audience, events_recent, now()
  FROM tiered
  ON CONFLICT (post_id) DO UPDATE
    SET velocity = EXCLUDED.velocity,
        score = EXCLUDED.score,
        reach_tier = EXCLUDED.reach_tier,
        audience_size = EXCLUDED.audience_size,
        events_recent = EXCLUDED.events_recent,
        computed_at = now();

  -- Decay: anything not refreshed in this pass and stale gets pushed down.
  UPDATE post_metrics
     SET velocity = velocity * 0.5,
         score = score * 0.5,
         reach_tier = GREATEST(0, reach_tier - 1),
         computed_at = now()
   WHERE computed_at < now() - interval '20 minutes';

  -- Mirror tier onto posts table so any reader can use it without a join.
  UPDATE posts p SET reach_tier = m.reach_tier
    FROM post_metrics m
   WHERE m.post_id = p.id::text AND p.reach_tier <> m.reach_tier;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_post_metrics() FROM PUBLIC, anon, authenticated;
