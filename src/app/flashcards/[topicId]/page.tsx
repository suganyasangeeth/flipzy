"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export default function FlashcardPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    load();
  }, [topicId]);

  async function load() {
    const { data: t } = await supabase
      .from("topics")
      .select("id, name, subject_id")
      .eq("id", topicId)
      .single();
    if (t) {
      const { data: s } = await supabase
        .from("subjects")
        .select("id, name, color, icon")
        .eq("id", t.subject_id)
        .single();
      if (s) setSubject(s);
    }

    const { data: f } = await supabase
      .from("flashcards")
      .select("id, front_text, back_text")
      .eq("topic_id", topicId)
      .eq("status", "published")
      .order("created_at", { ascending: true });
    if (f) setCards(f);

    setLoading(false);
  }

  function goNext() {
    if (currentIndex < cards.length - 1) {
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

  function playAgain() {
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Loading flashcards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <header className="w-full flex items-center px-4 md:px-6 h-16 md:h-20 border-b-2 md:border-b-4 border-outline-variant bg-arcade-surface">
          <button
            onClick={() => router.push(`/subjects/${subject?.id || ""}`)}
            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-surface-container-lowest border-2 md:border-4 border-outline-variant text-on-surface"
          >
            <span className="material-symbols-outlined text-base md:text-headline-md">arrow_back</span>
          </button>
          <h1 className="font-headline-lg text-headline-lg text-on-surface ml-3 md:ml-4 hidden md:block">
            {subject?.name || "Topic"}
          </h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
          <p className="font-headline-md text-headline-md text-on-surface-variant">
            No flashcards in this topic yet
          </p>
          <p className="font-body-md text-on-surface-variant opacity-70 mt-2">
            Ask an admin to upload some flashcards!
          </p>
        </main>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <article className="bg-arcade-surface rounded-2xl md:rounded-3xl p-6 md:p-container-padding py-12 md:py-24 flex flex-col items-center justify-center text-center shadow-card-ambient w-full max-w-2xl">
          <h1 className="font-display-hero text-headline-lg md:text-display-hero text-on-surface uppercase tracking-wider mb-2 md:mb-4">
            Great Job!
          </h1>
          <p className="font-headline-lg text-base md:text-headline-lg text-on-surface mb-6 md:mb-12">
            You completed the session!
          </p>
          <div className="flex flex-col w-full max-w-sm gap-3 md:gap-stack-gap">
            <button
              onClick={playAgain}
              className="w-full h-14 md:h-20 bg-primary rounded-full flex items-center justify-center gap-2 text-on-primary font-headline-md text-sm md:text-headline-md uppercase transition-transform hover:scale-105 active:scale-95 chunky-btn border-2 md:border-4 border-on-primary/20"
            >
              <span className="material-symbols-outlined text-2xl md:text-[32px]">replay</span>
              Play Again
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

  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="bg-background min-h-screen flex flex-col font-display-hero select-none">
      {/* Header */}
      <header className="w-full flex items-center px-4 md:px-6 h-16 md:h-20 border-b-2 md:border-b-4 border-outline-variant bg-arcade-surface">
        <button
          onClick={() => router.push(`/subjects/${subject?.id || ""}`)}
          className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-surface-container-lowest border-2 md:border-4 border-outline-variant text-on-surface shrink-0"
        >
          <span className="material-symbols-outlined text-base md:text-headline-md">arrow_back</span>
        </button>
        <h1 className="font-headline-lg text-headline-lg text-on-surface ml-3 md:ml-4 hidden md:block">
          {subject?.name || "Topic"}
        </h1>
        <div className="flex flex-col items-center justify-center gap-1 md:gap-2 flex-1 mx-2 md:mx-4">
          <div className="font-headline-md text-sm md:text-headline-md text-on-surface text-center">
            {currentIndex + 1} / {cards.length}
          </div>
          <div className="w-full max-w-xs md:max-w-sm h-3 md:h-4 bg-arcade-border rounded-full border-1 md:border-2 overflow-hidden relative">
            <div
              className="h-full bg-primary absolute left-0 top-0 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="w-10 md:w-14 shrink-0" />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
        {/* Flashcard */}
        <div
          className="w-full aspect-[4/3] md:aspect-[3/2] perspective-1000 mb-stack-gap cursor-pointer"
          onClick={() => setFlipped(!flipped)}
        >
          <div
            className={`w-full h-full relative transform-style-3d transition-transform duration-500 ease-in-out ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-arcade-surface flex flex-col items-center justify-center p-6 md:p-container-padding shadow-2xl rounded-3xl">
              <h2 className="text-body-lg md:text-headline-lg text-on-surface text-center px-2 md:px-12 leading-tight break-words w-full">
                {card.front_text}
              </h2>
              <div className="absolute bottom-4 md:bottom-container-padding">
                <span className="font-label-caps text-xs md:text-label-caps text-on-surface-variant uppercase opacity-60">
                  Tap for answer
                </span>
              </div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-arcade-surface flex flex-col items-center justify-center p-6 md:p-container-padding shadow-2xl rounded-3xl">
              <p className="text-body-lg md:text-headline-lg text-on-surface text-center px-2 md:px-12 leading-tight break-words w-full">
                {card.back_text}
              </p>
              <div className="absolute bottom-4 md:bottom-container-padding">
                <span className="font-label-caps text-xs md:text-label-caps text-on-surface-variant uppercase opacity-60">
                  Tap to flip back
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between w-full max-w-sm mt-4 md:mt-stack-gap gap-3 md:gap-stack-gap mb-6 md:mb-12">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex-1 h-14 md:h-20 bg-surface-container-lowest rounded-full flex items-center justify-center gap-2 text-on-surface font-headline-md text-sm md:text-headline-md uppercase transition-transform shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed border-2 border-outline-variant"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">arrow_back_ios</span>
            Prev
          </button>
          <button
            onClick={goNext}
            className="flex-1 h-14 md:h-20 bg-primary rounded-full flex items-center justify-center gap-2 text-on-primary font-headline-md text-sm md:text-headline-md uppercase transition-transform shadow-2xl chunky-btn border-2 md:border-4 border-on-primary/20"
          >
            {currentIndex === cards.length - 1 ? "Finish" : "Next"}
            <span className="material-symbols-outlined text-lg md:text-xl">arrow_forward_ios</span>
          </button>
        </div>
      </main>
    </div>
  );
}
