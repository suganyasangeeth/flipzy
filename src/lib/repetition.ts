import type { SupabaseClient } from "@supabase/supabase-js";

export type Rating = "hard" | "good" | "easy";

export interface ReviewState {
  ease_factor: number;
  interval_days: number;
}

const DEFAULT_STATE: ReviewState = { ease_factor: 2.5, interval_days: 0 };

export function sm2(rating: Rating, current: ReviewState = DEFAULT_STATE): ReviewState {
  let { ease_factor, interval_days } = current;

  if (rating === "hard") {
    interval_days = Math.max(1, Math.ceil(interval_days * 0.5));
    ease_factor = Math.max(1.3, ease_factor - 0.3);
  } else if (rating === "good") {
    if (interval_days === 0) {
      interval_days = 1;
    } else {
      interval_days = Math.ceil(interval_days * ease_factor);
    }
    ease_factor = Math.max(1.3, ease_factor + 0.1);
  } else {
    // easy
    if (interval_days === 0) {
      interval_days = 4;
    } else {
      interval_days = Math.ceil(interval_days * ease_factor * 1.3);
    }
    ease_factor = Math.max(1.3, ease_factor + 0.15);
  }

  return { ease_factor: Math.round(ease_factor * 100) / 100, interval_days };
}

export function nextReviewDate(intervalDays: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + intervalDays);
  d.setHours(0, 0, 0, 0);
  return d;
}

export interface DueCard {
  flashcard_id: string;
  front_text: string;
  back_text: string;
  ease_factor: number;
  interval_days: number;
  is_new: boolean;
}

export async function fetchDueCards(
  supabase: SupabaseClient,
  topicId: string,
  kidId: string
): Promise<DueCard[]> {
  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("id, front_text, back_text")
    .eq("topic_id", topicId)
    .eq("status", "published");

  if (!flashcards || flashcards.length === 0) return [];

  const { data: reviews } = await supabase
    .from("card_reviews")
    .select("flashcard_id, ease_factor, interval_days, next_review")
    .eq("kid_id", kidId)
    .in(
      "flashcard_id",
      flashcards.map((c: { id: string }) => c.id)
    );

  const reviewMap = new Map<
    string,
    { ease_factor: number; interval_days: number; next_review: string }
  >();
  (reviews ?? []).forEach(
    (r: {
      flashcard_id: string;
      ease_factor: number;
      interval_days: number;
      next_review: string;
    }) => {
      reviewMap.set(r.flashcard_id, {
        ease_factor: r.ease_factor,
        interval_days: r.interval_days,
        next_review: r.next_review,
      });
    }
  );

  const now = new Date();
  const newCards: DueCard[] = [];
  const reviewCards: DueCard[] = [];

  for (const card of flashcards) {
    const review = reviewMap.get(card.id);
    if (!review) {
      newCards.push({
        flashcard_id: card.id,
        front_text: card.front_text,
        back_text: card.back_text,
        ease_factor: DEFAULT_STATE.ease_factor,
        interval_days: DEFAULT_STATE.interval_days,
        is_new: true,
      });
    } else if (new Date(review.next_review) <= now) {
      reviewCards.push({
        flashcard_id: card.id,
        front_text: card.front_text,
        back_text: card.back_text,
        ease_factor: review.ease_factor,
        interval_days: review.interval_days,
        is_new: false,
      });
    }
  }

  reviewCards.sort((a, b) => {
    const aDate = new Date(
      reviewMap.get(a.flashcard_id)!.next_review
    ).getTime();
    const bDate = new Date(
      reviewMap.get(b.flashcard_id)!.next_review
    ).getTime();
    return aDate - bDate;
  });

  return [...newCards, ...reviewCards];
}

export async function todayReviewedCount(
  supabase: SupabaseClient,
  kidId: string,
  topicId?: string
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (topicId) {
    const { data: flashcards } = await supabase
      .from("flashcards")
      .select("id")
      .eq("topic_id", topicId);
    if (!flashcards || flashcards.length === 0) return 0;
    const cardIds = flashcards.map((c: { id: string }) => c.id);

    const { count } = await supabase
      .from("card_reviews")
      .select("id", { count: "exact", head: true })
      .eq("kid_id", kidId)
      .in("flashcard_id", cardIds)
      .gte("created_at", today.toISOString());
    return count ?? 0;
  }

  const { count } = await supabase
    .from("card_reviews")
    .select("id", { count: "exact", head: true })
    .eq("kid_id", kidId)
    .gte("created_at", today.toISOString());
  return count ?? 0;
}

export async function topicStats(
  supabase: SupabaseClient,
  kidId: string,
  topicId: string
): Promise<{ reviewed: number; total: number }> {
  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("id")
    .eq("topic_id", topicId)
    .eq("status", "published");
  if (!flashcards || flashcards.length === 0) return { reviewed: 0, total: 0 };

  const cardIds = flashcards.map((c: { id: string }) => c.id);
  const { data: reviews } = await supabase
    .from("card_reviews")
    .select("flashcard_id")
    .eq("kid_id", kidId)
    .in("flashcard_id", cardIds);

  return {
    reviewed: reviews?.length ?? 0,
    total: flashcards.length,
  };
}

export async function saveReview(
  supabase: SupabaseClient,
  kidId: string,
  flashcardId: string,
  rating: Rating,
  currentState: ReviewState
): Promise<void> {
  const newState = sm2(rating, currentState);
  const nextReview = nextReviewDate(newState.interval_days);

  const { error } = await supabase.from("card_reviews").upsert(
    {
      kid_id: kidId,
      flashcard_id: flashcardId,
      rating,
      ease_factor: newState.ease_factor,
      interval_days: newState.interval_days,
      next_review: nextReview.toISOString(),
      review_count: 1,
    },
    { onConflict: "kid_id,flashcard_id" }
  );

  if (error) throw error;
}
