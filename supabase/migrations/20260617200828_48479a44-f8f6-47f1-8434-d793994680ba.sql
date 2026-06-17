
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  domain TEXT NOT NULL,
  alt_domains TEXT[] NOT NULL DEFAULT '{}',
  sso_provider TEXT NOT NULL DEFAULT 'google',
  faculty_email_regex TEXT,
  student_email_regex TEXT,
  tint TEXT,
  initials TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.institutions TO anon, authenticated;
GRANT ALL ON public.institutions TO service_role;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "institutions are public read" ON public.institutions FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS institutions_name_trgm ON public.institutions USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS institutions_domain_idx ON public.institutions (domain);

CREATE TABLE IF NOT EXISTS public.institution_registration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_name TEXT NOT NULL,
  location TEXT,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  role TEXT,
  approx_students INT,
  notes TEXT,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.institution_registration_requests TO anon, authenticated;
GRANT ALL ON public.institution_registration_requests TO service_role;
ALTER TABLE public.institution_registration_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit registration request"
  ON public.institution_registration_requests FOR INSERT WITH CHECK (true);
