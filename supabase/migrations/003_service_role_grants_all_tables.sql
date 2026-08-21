-- Grant service_role access to subjects, topics, and flashcards
-- so the admin API routes can read/write these tables.

GRANT ALL ON public.subjects TO service_role;
GRANT ALL ON public.topics TO service_role;
GRANT ALL ON public.flashcards TO service_role;
