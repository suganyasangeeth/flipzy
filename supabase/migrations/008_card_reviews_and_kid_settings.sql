-- ============================================================
-- card_reviews table — spaced repetition tracking
-- ============================================================

CREATE TABLE card_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_id UUID NOT NULL REFERENCES kid_accounts(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('hard', 'good', 'easy')),
  ease_factor REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  review_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_card_reviews_kid_id ON card_reviews(kid_id);
CREATE INDEX idx_card_reviews_flashcard_id ON card_reviews(flashcard_id);
CREATE INDEX idx_card_reviews_next_review ON card_reviews(kid_id, flashcard_id, next_review);

ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with card_reviews
CREATE POLICY "Admins can manage card_reviews"
  ON card_reviews FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Kids can view and insert their own reviews
CREATE POLICY "Kids can view their own reviews"
  ON card_reviews FOR SELECT
  TO authenticated
  USING (kid_id = get_kid_id());

CREATE POLICY "Kids can insert their own reviews"
  ON card_reviews FOR INSERT
  TO authenticated
  WITH CHECK (kid_id = get_kid_id());

GRANT ALL ON public.card_reviews TO service_role;
GRANT SELECT, INSERT ON public.card_reviews TO authenticated;

-- ============================================================
-- kid_accounts new columns
-- ============================================================

ALTER TABLE kid_accounts ADD COLUMN daily_card_limit INTEGER NOT NULL DEFAULT 20;
ALTER TABLE kid_accounts ADD COLUMN has_seen_onboarding BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE kid_accounts ADD COLUMN is_paused BOOLEAN NOT NULL DEFAULT false;
