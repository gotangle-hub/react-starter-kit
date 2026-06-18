CREATE TABLE IF NOT EXISTS public.salary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field text NOT NULL,
  title text NOT NULL,
  pay_per_month numeric NOT NULL CHECK (pay_per_month >= 0),
  currency text NOT NULL DEFAULT 'AED',
  location text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.salary_entries TO authenticated;
GRANT ALL ON public.salary_entries TO service_role;

ALTER TABLE public.salary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can read salary entries"
  ON public.salary_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Signed-in users can insert anonymous salary entries"
  ON public.salary_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS salary_entries_created_at_idx ON public.salary_entries (created_at DESC);
CREATE INDEX IF NOT EXISTS salary_entries_field_idx ON public.salary_entries (field);
CREATE INDEX IF NOT EXISTS salary_entries_location_idx ON public.salary_entries (location);