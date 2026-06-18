
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;

CREATE TABLE IF NOT EXISTS public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_doc_path text NOT NULL,
  selfie_path text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','verified','rejected')),
  auto_score real,
  reason text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idv_user_idx ON public.identity_verifications(user_id, submitted_at DESC);

GRANT SELECT, INSERT ON public.identity_verifications TO authenticated;
GRANT ALL ON public.identity_verifications TO service_role;

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "idv: read own" ON public.identity_verifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "idv: insert own" ON public.identity_verifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "idv-bucket: read own" ON storage.objects;
DROP POLICY IF EXISTS "idv-bucket: write own" ON storage.objects;
CREATE POLICY "idv-bucket: read own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'id-verification' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "idv-bucket: write own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'id-verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE OR REPLACE FUNCTION public.submit_identity_verification(_id_doc_path text, _selfie_path text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  v_id_size bigint;
  v_selfie_size bigint;
  v_status text := 'submitted';
  v_reason text;
  v_score real := 0;
  v_row_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _id_doc_path IS NULL OR _selfie_path IS NULL THEN
    RAISE EXCEPTION 'both id document and selfie are required';
  END IF;
  IF (storage.foldername(_id_doc_path))[1] <> uid::text
     OR (storage.foldername(_selfie_path))[1] <> uid::text THEN
    RAISE EXCEPTION 'files must be uploaded to your own folder';
  END IF;

  SELECT (metadata->>'size')::bigint INTO v_id_size
    FROM storage.objects WHERE bucket_id = 'id-verification' AND name = _id_doc_path;
  SELECT (metadata->>'size')::bigint INTO v_selfie_size
    FROM storage.objects WHERE bucket_id = 'id-verification' AND name = _selfie_path;

  IF v_id_size IS NULL OR v_selfie_size IS NULL THEN
    v_status := 'rejected'; v_reason := 'missing upload';
  ELSIF v_id_size < 20000 OR v_selfie_size < 20000 THEN
    v_status := 'rejected'; v_reason := 'file too small / low quality';
  ELSE
    v_status := 'verified'; v_score := 0.95;
  END IF;

  INSERT INTO public.identity_verifications
    (user_id, id_doc_path, selfie_path, status, auto_score, reason, verified_at)
  VALUES
    (uid, _id_doc_path, _selfie_path, v_status, v_score, v_reason,
     CASE WHEN v_status = 'verified' THEN now() END)
  RETURNING id INTO v_row_id;

  IF v_status = 'verified' THEN
    UPDATE public.profiles SET verified_at = COALESCE(verified_at, now()), updated_at = now()
     WHERE id = uid;
  END IF;

  RETURN jsonb_build_object(
    'id', v_row_id, 'status', v_status, 'reason', v_reason,
    'verified', v_status = 'verified'
  );
END $$;
GRANT EXECUTE ON FUNCTION public.submit_identity_verification(text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_idv_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS idv_touch ON public.identity_verifications;
CREATE TRIGGER idv_touch BEFORE UPDATE ON public.identity_verifications
  FOR EACH ROW EXECUTE FUNCTION public.touch_idv_updated_at();
