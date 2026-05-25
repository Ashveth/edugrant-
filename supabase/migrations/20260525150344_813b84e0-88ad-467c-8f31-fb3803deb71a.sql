
-- 1) Restrict provider_profiles SELECT: drop public policy, replace with authenticated-only
DROP POLICY IF EXISTS "Anyone can view provider profiles" ON public.provider_profiles;

CREATE POLICY "Authenticated users can view provider profiles"
ON public.provider_profiles
FOR SELECT
TO authenticated
USING (true);

-- 2) Revoke EXECUTE on has_role from anon and authenticated.
-- RLS policies using has_role still work because policies run with definer context internally.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- 3) Revoke EXECUTE on internal trigger helpers (not meant to be called from API)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
