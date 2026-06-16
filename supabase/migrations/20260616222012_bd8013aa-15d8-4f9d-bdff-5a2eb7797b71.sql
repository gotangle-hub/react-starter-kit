CREATE TRIGGER prevent_account_type_change_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_account_type_change();

REVOKE EXECUTE ON FUNCTION public.prevent_account_type_change() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_account_type_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.prevent_account_type_change() FROM public;