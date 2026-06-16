
-- Explicit deny-by-default write policies (service role bypasses RLS for legitimate writes).

-- certificate_requests: prevent users from writing arbitrary rows via RLS
CREATE POLICY "Users can insert their own certificate requests"
  ON public.certificate_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificate requests"
  ON public.certificate_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certificate requests"
  ON public.certificate_requests
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- certificates: read-only for users; writes are service-role only.
-- No INSERT/UPDATE/DELETE policies → all writes denied for authenticated/anon.
-- Document intent with explicit restrictive deny policies.
CREATE POLICY "Deny inserts from clients on certificates"
  ON public.certificates AS RESTRICTIVE
  FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny updates from clients on certificates"
  ON public.certificates AS RESTRICTIVE
  FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny deletes from clients on certificates"
  ON public.certificates AS RESTRICTIVE
  FOR DELETE TO authenticated, anon
  USING (false);
