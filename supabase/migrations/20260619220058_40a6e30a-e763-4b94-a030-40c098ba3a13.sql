
-- ============================================================
-- class-docs bucket: require class-staff membership on upload
-- Path convention (set in src/services/uploads.ts + ProfessorUploadDoc):
--   {auth.uid()}/class-{class_id}/...
-- ============================================================
DROP POLICY IF EXISTS "class-docs write for class staff" ON storage.objects;

CREATE POLICY "class-docs write for class staff"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'class-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (storage.foldername(name))[2] LIKE 'class-%'
  AND public.is_class_staff(
    NULLIF(regexp_replace((storage.foldername(name))[2], '^class-', ''), '')::uuid,
    auth.uid()
  )
);

-- Tighten owner-only update/delete to also require current staff membership,
-- so a former TA cannot mutate files of a class they're no longer staff of.
DROP POLICY IF EXISTS "class-docs update own" ON storage.objects;
DROP POLICY IF EXISTS "class-docs delete own" ON storage.objects;

CREATE POLICY "class-docs update own"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'class-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (storage.foldername(name))[2] LIKE 'class-%'
  AND public.is_class_staff(
    NULLIF(regexp_replace((storage.foldername(name))[2], '^class-', ''), '')::uuid,
    auth.uid()
  )
);

CREATE POLICY "class-docs delete own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'class-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (storage.foldername(name))[2] LIKE 'class-%'
  AND public.is_class_staff(
    NULLIF(regexp_replace((storage.foldername(name))[2], '^class-', ''), '')::uuid,
    auth.uid()
  )
);

-- ============================================================
-- id-verification bucket: explicit owner-only UPDATE/DELETE.
-- Bucket remains private. Service role retains full access.
-- ============================================================
DROP POLICY IF EXISTS "idv-bucket: update own" ON storage.objects;
DROP POLICY IF EXISTS "idv-bucket: delete own" ON storage.objects;

CREATE POLICY "idv-bucket: update own"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'id-verification'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'id-verification'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "idv-bucket: delete own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'id-verification'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
