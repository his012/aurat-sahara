-- Harden the portfolio-images UPDATE storage policy by adding a WITH CHECK
-- condition so a user cannot re-point a file into another user's folder.
DROP POLICY IF EXISTS "Users can update their own portfolio images" ON storage.objects;

CREATE POLICY "Users can update their own portfolio images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  (bucket_id = 'portfolio-images'::text)
  AND ((storage.foldername(name))[1] = (auth.uid())::text)
)
WITH CHECK (
  (bucket_id = 'portfolio-images'::text)
  AND ((storage.foldername(name))[1] = (auth.uid())::text)
);