"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  type DueCard,
  type Rating,
  type ReviewState,
  fetchDueCards,
  todayReviewedCount,
  saveReview,
  sm2,
  topicStats,
} from "@/lib/repetition";

interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface KidProfile {
  id: string;
  daily_card_limit: number;
  is_paused: boolean;
  has_seen_onboarding: boolean;
}

function getIconColor(bgHex: string): string {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#071B37" : "#ffffff";
}

function renderMultiline(text: string) {
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

export default function FlashcardPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [kid, setKid] = useState<KidProfile | null>(null);
  const [dueCards, setDueCards] = useState<DueCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [limitOverride, setLimitOverride] = useState(false);
  const [topicStatsData, setTopicStatsData] = useState<{ reviewed: number; total: number } | null>(null);

  const load = useCallback(async () => {
    if (!topicId) return;

    const { data: t } = await supabase
      .from("topics")
      .select("id, name, subject_id")
      .eq("id", topicId)
      .single();
    if (t) {
      setTopic(t);
      const { data: s } = await supabase
        .from("subjects")
        .select("id, name, color, icon")
        .eq("id", t.subject_id)
        .single();
      if (s) setSubject(s);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: k } = await supabase
      .from("kid_accounts")
      .select("id, daily_card_limit, is_paused, has_seen_onboarding")
      .eq("email", user.email)
      .single();
    if (k) {
      setKid(k);
      if (!k.has_seen_onboarding) setOnboardingStep(1);

      if (!k.is_paused) {
        const cards = await fetchDueCards(supabase, topicId, k.id);
        const reviewed = await todayReviewedCount(supabase, k.id, topicId);
        setTodayCount(reviewed);
        setLimitOverride(false);

        const stats = await topicStats(supabase, k.id, topicId);
        setTopicStatsData(stats);

        const remaining = k.daily_card_limit - reviewed;
        setDueCards(remaining > 0 ? cards.slice(0, remaining) : cards);
      }
    }

    setLoading(false);
  }, [topicId]);

  useEffect(() => {
    load();
  }, [load]);

  function dismissOnboarding() {
    setOnboardingStep(0);
    if (kid) {
      supabase
        .from("kid_accounts")
        .update({ has_seen_onboarding: true })
        .eq("id", kid.id);
    }
  }

  function goNext() {
    if (currentIndex < dueCards.length - 1) {
      setFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 50);
    } else {
      setCompleted(true);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex - 1), 50);
    }
  }

  async function handleRate(rating: Rating) {
    if (!kid || currentIndex >= dueCards.length) return;
    const card = dueCards[currentIndex];
    const state: ReviewState = {
      ease_factor: card.ease_factor,
      interval_days: card.interval_days,
    };

    try {
      await saveReview(supabase, kid.id, card.flashcard_id, rating, state);
      setTodayCount((c) => c + 1);

      const updated = { ...card, ...sm2(rating, state) };
      const newCards = [...dueCards];
      newCards[currentIndex] = updated;
      setDueCards(newCards);

      goNext();
    } catch {
      // ignore save errors silently
    }
  }

  function playAgain() {
    setLoading(true);
    setCompleted(false);
    setCurrentIndex(0);
    setFlipped(false);
    setDueCards([]);
    load();
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Loading flashcards...</p>
      </div>
    );
  }

  if (kid?.is_paused) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <header className="w-full bg-arcade-surface border-b-2 border-arcade-border flex items-center px-4 md:px-6 h-16 md:h-20 shrink-0">
          <button
            onClick={() => router.push(`/subjects/${subject?.id || ""}`)}
            className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="font-label-caps text-xs hidden md:inline">Back</span>
          </button>
          <div className="flex-1 flex justify-center">
            <img src="/brand/flipzy-logo-horizontal.svg" alt="Flipzy" className="h-10 md:h-14" />
          </div>
          <div className="w-20 shrink-0" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">pause_circle</span>
          <p className="font-headline-md text-headline-md text-on-surface-variant text-center">
            Learning is paused
          </p>
          <p className="font-body-md text-on-surface-variant opacity-70 mt-2 text-center">
            Ask an admin to unpause your account.
          </p>
        </main>
      </div>
    );
  }

  if (dueCards.length === 0 && !loading) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <header className="w-full bg-arcade-surface border-b-2 border-arcade-border flex items-center px-4 md:px-6 h-16 md:h-20 shrink-0">
          <button
            onClick={() => router.push(`/subjects/${subject?.id || ""}`)}
            className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="font-label-caps text-xs hidden md:inline">Back</span>
          </button>
          <div className="flex-1 flex justify-center">
            <img src="/brand/flipzy-logo-horizontal.svg" alt="Flipzy" className="h-10 md:h-14" />
          </div>
          <div className="w-20 shrink-0" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <span className="material-symbols-outlined text-6xl text-tertiary mb-4">check_circle</span>
          <p className="font-headline-md text-headline-md text-on-surface text-center">
            All caught up!
          </p>
          <p className="font-body-md text-on-surface-variant opacity-70 mt-2 text-center">
            No cards to review right now. Check back later!
          </p>
          <button
            onClick={() => router.push(`/subjects/${subject?.id || ""}`)}
            className="mt-6 h-12 px-6 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps uppercase chunky-btn border-4 border-on-primary/20"
          >
            Choose Topic
          </button>
        </main>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        <span className="absolute top-[15%] left-[12%] text-4xl md:text-6xl opacity-60" style={{ animation: "sparkle-pulse 2s ease-in-out infinite" }}>✨</span>
        <span className="absolute top-[20%] right-[15%] text-3xl md:text-5xl opacity-50" style={{ animation: "sparkle-pulse 2.5s ease-in-out infinite 0.5s" }}>⭐</span>
        <span className="absolute bottom-[25%] left-[18%] text-3xl md:text-4xl opacity-50" style={{ animation: "sparkle-pulse 3s ease-in-out infinite 1s" }}>🌟</span>
        <span className="absolute bottom-[20%] right-[10%] text-4xl md:text-5xl opacity-60" style={{ animation: "sparkle-pulse 2.2s ease-in-out infinite 0.3s" }}>✨</span>

        <article className="bg-arcade-surface rounded-2xl md:rounded-3xl p-6 md:p-container-padding py-12 md:py-24 flex flex-col items-center justify-center text-center shadow-card-ambient w-full max-w-2xl border-2 border-arcade-border border-t-4 border-primary relative z-10">
          <h1 className="font-display-hero text-headline-lg md:text-display-hero text-on-surface tracking-wider mb-2 md:mb-4">
            Great Job! 🎉
          </h1>
          <p className="font-headline-lg text-base md:text-headline-lg text-on-surface mb-6 md:mb-12">
            You reviewed {dueCards.length} card{dueCards.length !== 1 ? "s" : ""}!
          </p>
          <div className="flex flex-col w-full max-w-sm gap-3 md:gap-stack-gap">
            <button
              onClick={playAgain}
              className="w-full h-14 md:h-20 bg-primary rounded-full flex items-center justify-center gap-2 text-on-primary font-headline-md text-sm md:text-headline-md uppercase transition-transform hover:scale-105 active:scale-95 chunky-btn border-2 md:border-4 border-on-primary/20"
            >
              <span className="material-symbols-outlined text-2xl md:text-[32px]">replay</span>
              Review Again
            </button>
            <button
              onClick={() => router.push(`/subjects/${subject?.id || ""}`)}
              className="w-full h-14 md:h-20 bg-arcade-surface rounded-full flex items-center justify-center gap-2 text-primary font-headline-md text-sm md:text-headline-md uppercase transition-transform hover:scale-105 active:scale-95 border-2 border-primary shadow-card-ambient"
            >
              <span className="material-symbols-outlined text-xl md:text-[28px]">grid_view</span>
              Choose New Topic
            </button>
          </div>
        </article>
      </div>
    );
  }

  const card = dueCards[currentIndex];
  const progress = ((currentIndex + 1) / dueCards.length) * 100;

  return (
    <div className="bg-background min-h-screen flex flex-col font-display-hero select-none">
      {/* Onboarding walkthrough */}
      {onboardingStep > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-arcade-surface rounded-2xl p-6 md:p-8 max-w-md w-full border-t-4 border-primary shadow-card-ambient text-center">
            {/* Step indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    s === onboardingStep ? "bg-primary" : "bg-outline-variant"
                  }`}
                />
              ))}
            </div>

            {onboardingStep === 1 && (
              <>
                <span className="material-symbols-outlined text-6xl text-secondary mb-4">touch_app</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">
                  Tap to Reveal
                </h2>
                <p className="font-body-md text-on-surface-variant mb-6">
                  Tap any card to flip it and see the answer on the other side.
                </p>
              </>
            )}
            {onboardingStep === 2 && (
              <>
                <span className="material-symbols-outlined text-6xl text-tertiary mb-4">rate_review</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">
                  Rate Yourself
                </h2>
                <p className="font-body-md text-on-surface-variant mb-6">
                  After revealing the answer, pick <strong>Hard</strong>, <strong>Good</strong>, or <strong>Easy</strong> to tell Flipzy how well you knew it.
                </p>
              </>
            )}
            {onboardingStep === 3 && (
              <>
                <span className="material-symbols-outlined text-6xl text-primary mb-4">auto_awesome</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3">
                  Smart Repetition
                </h2>
                <p className="font-body-md text-on-surface-variant mb-6">
                  Cards you find hard will show up more often. Easy ones space out over time. It adapts to you!
                </p>
              </>
            )}

            <div className="flex gap-3">
              {onboardingStep > 1 && (
                <button
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="flex-1 h-14 bg-surface-container-lowest text-on-surface font-label-caps text-label-caps uppercase rounded-xl border-2 border-outline-variant"
                >
                  Back
                </button>
              )}
              <button
                onClick={onboardingStep < 3 ? () => setOnboardingStep(onboardingStep + 1) : dismissOnboarding}
                className="flex-1 h-14 bg-primary text-on-primary font-label-caps text-label-caps uppercase rounded-xl chunky-btn border-4 border-on-primary/20"
              >
                {onboardingStep < 3 ? "Next" : "Got it!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full bg-arcade-surface border-b-2 border-arcade-border flex items-center px-4 md:px-6 h-16 md:h-20 shrink-0">
        <button
          onClick={() => router.push(`/subjects/${subject?.id || ""}`)}
          className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5 shrink-0"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="font-label-caps text-xs hidden md:inline">Back</span>
        </button>
        <div className="flex-1 flex justify-center">
          <img src="/brand/flipzy-logo-horizontal.svg" alt="Flipzy" className="h-10 md:h-14" />
        </div>
        <div className="w-20 shrink-0" />
      </header>

      {/* Subject + Topic */}
      <div className="w-full px-4 md:px-6 pt-4 md:pt-5">
        <div className="max-w-3xl mx-auto bg-arcade-surface rounded-2xl shadow-card-ambient px-5 py-3 md:px-6 md:py-3.5 flex items-center gap-3">
          {subject && (
            <div
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: subject.color }}
            >
              <span className="material-symbols-outlined text-xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1", color: getIconColor(subject.color) }}>
                {subject.icon}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
            <span className="font-headline-md text-base md:text-headline-md text-on-surface-variant shrink-0">
              {subject?.name}
            </span>
            <span className="text-outline-variant font-normal">/</span>
            <span className="font-headline-lg text-lg md:text-headline-lg text-on-surface font-extrabold truncate">
              {topic?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full flex flex-col items-center gap-1.5 md:gap-2 px-4 pt-3 md:pt-4 pb-1">
        <div className="font-headline-md text-sm md:text-headline-md text-on-surface text-center">
          {currentIndex + 1} / {dueCards.length}
          {topicStatsData && (
            <span className="text-on-surface-variant ml-2 text-xs md:text-sm">
              ({topicStatsData.reviewed}/{topicStatsData.total} learned)
            </span>
          )}
        </div>
        <div className="w-full max-w-md h-3 md:h-4 bg-arcade-border rounded-full border-1 md:border-2 overflow-hidden relative">
          <div
            className="h-full bg-primary absolute left-0 top-0 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main — card + controls */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-6 max-w-3xl mx-auto w-full">
        {/* Daily limit banner */}
        {todayCount >= (kid?.daily_card_limit ?? 20) && !limitOverride && (
          <div className="w-full max-w-md mb-3 bg-tertiary/10 border-2 border-tertiary/30 rounded-xl p-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-tertiary shrink-0">flag</span>
            <p className="font-body-md text-on-surface text-sm flex-1">
              Daily limit reached for this topic!
            </p>
            <button
              onClick={() => setLimitOverride(true)}
              className="shrink-0 h-8 px-3 rounded-lg bg-tertiary text-on-tertiary font-label-caps text-xs uppercase border-2 border-on-tertiary/20"
            >
              Continue
            </button>
          </div>
        )}
        {/* Flashcard */}
        <div
          className="w-full aspect-[4/3] md:aspect-[16/9] perspective-1000 mb-3 md:mb-4 cursor-pointer group"
          onClick={() => !flipped && setFlipped(true)}
        >
          <div
            className={`w-full h-full relative transform-style-3d transition-transform duration-500 ease-in-out ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white flex flex-col items-center justify-center p-5 md:p-8 shadow-2xl rounded-3xl border-2 border-secondary border-t-4 border-t-secondary transition-all duration-200 group-hover:scale-[1.01]">
              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <span className="material-symbols-outlined text-lg md:text-xl text-secondary/20" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>
              <h2 className="text-body-lg md:text-headline-md text-on-surface text-center px-2 md:px-8 leading-snug break-words w-full">
                {renderMultiline(card.front_text)}
              </h2>
              <div className="absolute bottom-3 md:bottom-4">
                <span className="font-label-caps text-xs text-on-surface-variant uppercase opacity-60">
                  Tap for answer
                </span>
              </div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#FFD83D] to-[#FFC20A] flex flex-col items-center justify-center p-5 md:p-8 shadow-2xl rounded-3xl border-2 border-primary">
              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <span className="material-symbols-outlined text-lg md:text-xl text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>
              <p className="text-body-lg md:text-headline-md text-primary text-center px-2 md:px-8 leading-snug break-words w-full">
                {renderMultiline(card.back_text)}
              </p>
              <div className="absolute bottom-3 md:bottom-4">
                <span className="font-label-caps text-xs text-primary/60 uppercase">
                  Rate your answer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        {flipped ? (
          <div className="flex items-center gap-3 md:gap-4 w-full max-w-lg">
            <button
              onClick={() => handleRate("hard")}
              className="flex-1 h-12 md:h-14 bg-error/10 text-error rounded-full flex items-center justify-center gap-2 font-headline-md text-sm md:text-headline-md uppercase transition-all hover:bg-error/20 active:scale-95 border-2 border-error/30"
            >
              <span className="material-symbols-outlined text-lg md:text-xl">sentiment_dissatisfied</span>
              Hard
            </button>
            <button
              onClick={() => handleRate("good")}
              className="flex-1 h-12 md:h-14 bg-secondary/10 text-secondary rounded-full flex items-center justify-center gap-2 font-headline-md text-sm md:text-headline-md uppercase transition-all hover:bg-secondary/20 active:scale-95 border-2 border-secondary/30"
            >
              <span className="material-symbols-outlined text-lg md:text-xl">sentiment_satisfied</span>
              Good
            </button>
            <button
              onClick={() => handleRate("easy")}
              className="flex-1 h-12 md:h-14 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center gap-2 font-headline-md text-sm md:text-headline-md uppercase transition-all hover:bg-tertiary/20 active:scale-95 border-2 border-tertiary/30"
            >
              <span className="material-symbols-outlined text-lg md:text-xl">sentiment_very_satisfied</span>
              Easy
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full max-w-sm gap-3 md:gap-4">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex-1 h-12 md:h-14 bg-surface-container-lowest rounded-full flex items-center justify-center gap-2 text-on-surface font-headline-md text-sm md:text-headline-md uppercase transition-transform shadow-lg disabled:opacity-40 disabled:cursor-not-allowed border-2 border-outline-variant hover:translate-y-0.5"
            >
              <span className="material-symbols-outlined text-lg md:text-xl">arrow_back_ios</span>
              Prev
            </button>
            <button
              onClick={() => setFlipped(true)}
              className="flex-1 h-12 md:h-14 bg-primary rounded-full flex items-center justify-center gap-2 text-on-primary font-headline-md text-sm md:text-headline-md uppercase transition-transform shadow-lg chunky-btn border-2 md:border-4 border-on-primary/20 hover:translate-y-0.5"
            >
              Reveal
              <span className="material-symbols-outlined text-lg md:text-xl">arrow_forward_ios</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
