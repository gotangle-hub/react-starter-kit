-- Public-profile pass: allow any signed-in user to read non-sensitive profile
-- fields (display_name, avatar_path, banner_path, bio, disciplines, location,
-- links, account_type). Owner-only fields stay restricted.

DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;

CREATE POLICY "Profiles: select public fields"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- Column-level: hide marketing_opt_in from non-owner reads by revoking SELECT
-- on that column for the authenticated role. Reading it for the owner goes
-- through the security-definer RPC below.
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT
  (id, account_type, display_name, disciplines, bio, location, links,
   avatar_path, banner_path, created_at, updated_at)
  ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_marketing_opt_in()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT marketing_opt_in FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_marketing_opt_in() TO authenticated;