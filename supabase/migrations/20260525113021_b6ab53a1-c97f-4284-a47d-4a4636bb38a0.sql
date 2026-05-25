
revoke execute on function public.has_role(uuid, app_role) from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
