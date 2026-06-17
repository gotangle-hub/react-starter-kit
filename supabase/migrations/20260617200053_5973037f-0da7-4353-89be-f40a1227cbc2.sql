
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE,
  title TEXT NOT NULL,
  organiser TEXT NOT NULL,
  field TEXT NOT NULL,
  location TEXT NOT NULL,
  deadline DATE,
  deadline_label TEXT,
  prize TEXT,
  prize_kind TEXT,
  eligibility TEXT NOT NULL DEFAULT 'all',
  audience TEXT NOT NULL DEFAULT 'all',
  source_url TEXT,
  source TEXT NOT NULL DEFAULT 'curated',
  is_official BOOLEAN NOT NULL DEFAULT false,
  interested_count INT NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.competitions TO anon, authenticated;
GRANT ALL ON public.competitions TO service_role;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "competitions are public read"
  ON public.competitions FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS competitions_deadline_idx ON public.competitions (deadline);
CREATE INDEX IF NOT EXISTS competitions_field_idx ON public.competitions (field);
CREATE INDEX IF NOT EXISTS competitions_audience_idx ON public.competitions (audience);

CREATE TABLE IF NOT EXISTS public.competition_user_state (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  pinned BOOLEAN NOT NULL DEFAULT false,
  interested BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, competition_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.competition_user_state TO authenticated;
GRANT ALL ON public.competition_user_state TO service_role;
ALTER TABLE public.competition_user_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user manages own competition state"
  ON public.competition_user_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_competitions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS competitions_touch ON public.competitions;
CREATE TRIGGER competitions_touch BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION public.touch_competitions_updated_at();

DROP TRIGGER IF EXISTS competition_user_state_touch ON public.competition_user_state;
CREATE TRIGGER competition_user_state_touch BEFORE UPDATE ON public.competition_user_state
  FOR EACH ROW EXECUTE FUNCTION public.touch_competitions_updated_at();
