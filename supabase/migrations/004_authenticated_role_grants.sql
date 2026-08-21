-- Grant authenticated role the base privileges needed for RLS to work.
-- RLS policies only gate access AFTER the role has table-level privileges.

GRANT SELECT ON public.subjects TO authenticated;
GRANT SELECT ON public.topics TO authenticated;
GRANT SELECT ON public.flashcards TO authenticated;
GRANT SELECT ON public.kid_accounts TO authenticated;
GRANT SELECT ON public.kid_subject_visibility TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.flashcards TO authenticated;
