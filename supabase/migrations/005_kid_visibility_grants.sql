-- Grant authenticated role full CRUD on kid_subject_visibility.
-- Without this, admin toggles (which run as the authenticated role
-- via the browser client) silently fail on INSERT/UPDATE/DELETE
-- even though the RLS policies allow it.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.kid_subject_visibility TO authenticated;
