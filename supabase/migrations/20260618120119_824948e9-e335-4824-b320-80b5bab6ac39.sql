ALTER TABLE public.identity_verifications ADD COLUMN IF NOT EXISTS inquiry_id text;
CREATE INDEX IF NOT EXISTS idx_identity_verifications_inquiry_id ON public.identity_verifications(inquiry_id);