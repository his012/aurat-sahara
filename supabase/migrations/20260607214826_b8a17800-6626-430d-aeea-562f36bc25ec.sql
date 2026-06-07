CREATE POLICY "Users can upload their own work proofs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'work-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own work proofs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'work-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own work proofs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'work-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);