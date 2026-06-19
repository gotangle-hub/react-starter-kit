ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_seen_at timestamptz;

COMMENT ON COLUMN public.profiles.onboarding_seen_at IS
  'G12 — server-side flag for once-only welcome + coachmark tour. Stamped on tour completion/skip. Null = not yet seen.';
