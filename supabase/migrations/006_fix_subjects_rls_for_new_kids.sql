-- Fix subjects RLS: kids see all globally-visible subjects by default.
-- Per-kid hiding is handled client-side via kid_subject_visibility.
-- Previously, new kids with no kid_subject_visibility rows could see ZERO subjects.

DROP POLICY "Subjects visible to kids" ON subjects;

CREATE POLICY "Subjects visible to kids"
  ON subjects FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR visible = true
  );
