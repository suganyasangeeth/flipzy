"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
}

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

function getIconColor(bgHex: string): string {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#071B37" : "#ffffff";
}

export default function FlashcardPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
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
      setTopic(t);
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
        <header className="w-full bg-arcade-surface border-b-2 border-arcade-border flex items-center px-4 md:px-6 h-16 md:h-20 shrink-0">
          <button
            onClick={() => router.push(`/subjects/${subject?.id || ""}`)}
            className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="font-label-caps text-xs hidden md:inline">Back</span>
          </button>
          <img
            src="/brand/flipzy-logo-horizontal.svg"
            alt="Flipzy"
            className="h-8 md:h-10 ml-4"
          />
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
      <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {/* Sparkle decorations */}
        <span className="absolute top-[15%] left-[12%] text-4xl md:text-6xl opacity-60" style={{ animation: "sparkle-pulse 2s ease-in-out infinite" }}>✨</span>
        <span className="absolute top-[20%] right-[15%] text-3xl md:text-5xl opacity-50" style={{ animation: "sparkle-pulse 2.5s ease-in-out infinite 0.5s" }}>⭐</span>
        <span className="absolute bottom-[25%] left-[18%] text-3xl md:text-4xl opacity-50" style={{ animation: "sparkle-pulse 3s ease-in-out infinite 1s" }}>🌟</span>
        <span className="absolute bottom-[20%] right-[10%] text-4xl md:text-5xl opacity-60" style={{ animation: "sparkle-pulse 2.2s ease-in-out infinite 0.3s" }}>✨</span>

        <article className="bg-arcade-surface rounded-2xl md:rounded-3xl p-6 md:p-container-padding py-12 md:py-24 flex flex-col items-center justify-center text-center shadow-card-ambient w-full max-w-2xl border-2 border-arcade-border border-t-4 border-primary relative z-10">
          <h1 className="font-display-hero text-headline-lg md:text-display-hero text-on-surface tracking-wider mb-2 md:mb-4">
            Great Job! 🎉
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
      {/* Header — clean: back pill + logo only */}
      <header className="w-full bg-arcade-surface border-b-2 border-arcade-border flex items-center px-4 md:px-6 h-16 md:h-20 shrink-0">
        <button
          onClick={() => router.push(`/subjects/${subject?.id || ""}`)}
          className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="font-label-caps text-xs hidden md:inline">Back</span>
        </button>
        <img
          src="/brand/flipzy-logo-horizontal.svg"
          alt="Flipzy"
          className="h-8 md:h-10 ml-4"
        />
      </header>

      {/* Subject chip breadcrumb */}
      <div className="w-full flex justify-center px-4 pt-3 md:pt-4">
        <div className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 py-1.5 border border-outline-variant">
          {subject && (
            <>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: subject.color }}
              >
                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1", color: getIconColor(subject.color) }}>
                  {subject.icon}
                </span>
              </div>
              <span className="font-label-caps text-xs text-on-surface-variant">{subject.name}</span>
              <span className="material-symbols-outlined text-xs text-outline-variant">chevron_right</span>
            </>
          )}
          <span className="font-label-caps text-xs text-on-surface font-semibold truncate max-w-[140px] md:max-w-none">{topic?.name}</span>
        </div>
      </div>

      {/* Progress bar — centered below header */}
      <div className="w-full flex flex-col items-center gap-1.5 md:gap-2 px-4 pt-3 md:pt-4 pb-2">
        <div className="font-headline-md text-sm md:text-headline-md text-on-surface text-center">
          {currentIndex + 1} / {cards.length}
        </div>
        <div className="w-full max-w-md h-3 md:h-4 bg-arcade-border rounded-full border-1 md:border-2 overflow-hidden relative">
          <div
            className="h-full bg-primary absolute left-0 top-0 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main — card + controls stacked top-to-bottom */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 pt-2 md:pt-4 pb-6 md:pb-8 max-w-3xl mx-auto w-full">
        {/* Flashcard */}
        <div
          className="w-full aspect-[4/3] md:aspect-[5/3] perspective-1000 mb-4 md:mb-6 cursor-pointer group"
          onClick={() => setFlipped(!flipped)}
        >
          <div
            className={`w-full h-full relative transform-style-3d transition-transform duration-500 ease-in-out ${
              flipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-arcade-surface flex flex-col items-center justify-center p-6 md:p-container-padding shadow-2xl rounded-3xl border-2 border-arcade-border border-t-4 border-primary transition-all duration-200 group-hover:scale-[1.01]">
              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <span className="material-symbols-outlined text-lg md:text-xl text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>
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
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-arcade-surface flex flex-col items-center justify-center p-6 md:p-container-padding shadow-2xl rounded-3xl border-2 border-arcade-border border-t-4 border-primary">
              <div className="absolute top-3 right-3 md:top-4 md:right-4">
                <span className="material-symbols-outlined text-lg md:text-xl text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>
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
        <div className="flex items-center justify-between w-full max-w-sm gap-3 md:gap-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex-1 h-12 md:h-16 bg-surface-container-lowest rounded-full flex items-center justify-center gap-2 text-on-surface font-headline-md text-sm md:text-headline-md uppercase transition-transform shadow-lg disabled:opacity-40 disabled:cursor-not-allowed border-2 border-outline-variant hover:translate-y-0.5"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">arrow_back_ios</span>
            Prev
          </button>
          <button
            onClick={goNext}
            className="flex-1 h-12 md:h-16 bg-primary rounded-full flex items-center justify-center gap-2 text-on-primary font-headline-md text-sm md:text-headline-md uppercase transition-transform shadow-lg chunky-btn border-2 md:border-4 border-on-primary/20 hover:translate-y-0.5"
          >
            {currentIndex === cards.length - 1 ? "Finish" : "Next"}
            <span className="material-symbols-outlined text-lg md:text-xl">arrow_forward_ios</span>
          </button>
        </div>
      </main>
    </div>
  );
}
