REVOKE EXECUTE ON FUNCTION public.increment_api_key_usage(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_api_key_usage(UUID) TO service_role;