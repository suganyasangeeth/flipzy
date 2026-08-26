-- Unique constraint for upsert on card_reviews
ALTER TABLE card_reviews ADD CONSTRAINT card_reviews_kid_flashcard_unique UNIQUE (kid_id, flashcard_id);

-- Kids can update their own reviews (needed for upsert)
CREATE POLICY "Kids can update their own reviews"
  ON card_reviews FOR UPDATE
  TO authenticated
  USING (kid_id = get_kid_id())
  WITH CHECK (kid_id = get_kid_id());

GRANT UPDATE ON public.card_reviews TO authenticated;
