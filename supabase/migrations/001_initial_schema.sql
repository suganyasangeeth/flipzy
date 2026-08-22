-- Flipzy database schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6d3bd6',
  icon TEXT NOT NULL DEFAULT 'book',
  "order" INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kid_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kid_subject_visibility (
  kid_id UUID NOT NULL REFERENCES kid_accounts(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  visible BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (kid_id, subject_id)
);

-- Indexes for foreign keys
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX idx_kid_subject_visibility_kid_id ON kid_subject_visibility(kid_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kid_subject_visibility ENABLE ROW LEVEL SECURITY;

-- Helper: check if the current user has the 'admin' role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data ->> 'role' = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get the kid_id linked to the current auth user
CREATE OR REPLACE FUNCTION get_kid_id()
RETURNS UUID AS $$
  SELECT id FROM kid_accounts WHERE email = auth.email();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- subjects ----
-- Admins see all; kids see all globally-visible subjects.
-- Per-kid hiding is handled client-side via kid_subject_visibility.
CREATE POLICY "Subjects visible to kids"
  ON subjects FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR visible = true
  );

-- Only admins can insert/update/delete subjects
CREATE POLICY "Admins can insert subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (is_admin());

-- ---- topics ----
CREATE POLICY "Authenticated users can view topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert topics"
  ON topics FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update topics"
  ON topics FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete topics"
  ON topics FOR DELETE
  TO authenticated
  USING (is_admin());

-- ---- flashcards ----
-- Kids can only read published flashcards
CREATE POLICY "Kids can view published flashcards"
  ON flashcards FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    OR is_admin()
  );

CREATE POLICY "Admins can insert flashcards"
  ON flashcards FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update flashcards"
  ON flashcards FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete flashcards"
  ON flashcards FOR DELETE
  TO authenticated
  USING (is_admin());

-- ---- kid_accounts ----
-- Admins see all; kids see only their own row
CREATE POLICY "Admins can view kid accounts"
  ON kid_accounts FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Kids can view their own account"
  ON kid_accounts FOR SELECT
  TO authenticated
  USING (id = get_kid_id());

CREATE POLICY "Admins can insert kid accounts"
  ON kid_accounts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update kid accounts"
  ON kid_accounts FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete kid accounts"
  ON kid_accounts FOR DELETE
  TO authenticated
  USING (is_admin());

-- ---- kid_subject_visibility ----
-- Admins can manage; kids can read their own visibility
CREATE POLICY "Admins can view all kid visibility"
  ON kid_subject_visibility FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Kids can view their own visibility"
  ON kid_subject_visibility FOR SELECT
  TO authenticated
  USING (kid_id = get_kid_id());

CREATE POLICY "Admins can manage kid visibility"
  ON kid_subject_visibility FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- SERVICE ROLE GRANTS
-- Allow the service_role (used by the signup API route) to write
-- into kid_accounts and kid_subject_visibility.
-- ============================================================

GRANT ALL ON public.kid_accounts TO service_role;
GRANT ALL ON public.kid_subject_visibility TO service_role;
GRANT ALL ON public.subjects TO service_role;
GRANT ALL ON public.topics TO service_role;
GRANT ALL ON public.flashcards TO service_role;

-- ============================================================
-- AUTHENTICATED ROLE GRANTS
-- Grant minimum required privileges so RLS policies can gate access.
-- ============================================================

GRANT SELECT ON public.subjects TO authenticated;
GRANT SELECT ON public.topics TO authenticated;
GRANT SELECT ON public.flashcards TO authenticated;
GRANT SELECT ON public.kid_accounts TO authenticated;
GRANT SELECT ON public.kid_subject_visibility TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.flashcards TO authenticated;
