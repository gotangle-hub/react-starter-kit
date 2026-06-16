
-- WORK BUCKET — owner-folder access
CREATE POLICY "work owner read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'work' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "work owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'work' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "work owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'work' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "work owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'work' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CLASS-DOCS BUCKET — uploader-only for now (class membership reads come later)
CREATE POLICY "class-docs owner read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'class-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "class-docs owner insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'class-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "class-docs owner update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'class-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "class-docs owner delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'class-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
