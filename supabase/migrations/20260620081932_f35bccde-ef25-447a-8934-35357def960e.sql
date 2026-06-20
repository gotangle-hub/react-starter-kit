CREATE OR REPLACE FUNCTION public.check_username_available(_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    _name IS NOT NULL
    AND lower(btrim(_name)) ~ '^[a-z0-9_.-]{3,20}$'
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE username = lower(btrim(_name))
    );
$function$;