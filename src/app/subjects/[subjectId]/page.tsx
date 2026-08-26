"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
}

interface Topic {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  order: number;
}

function getIconColor(bgHex: string): string {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#071B37" : "#ffffff";
}

export default function TopicSelectorPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) return;
    load();
  }, [subjectId]);

  async function load() {
    const { data: s } = await supabase
      .from("subjects")
      .select("id, name, color, icon, order")
      .eq("id", subjectId)
      .single();
    if (s) setSubject(s);

    const { data: t } = await supabase
      .from("topics")
      .select("id, subject_id, name, description, order")
      .eq("subject_id", subjectId)
      .order("order", { ascending: true });
    if (t) setTopics(t);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <header className="w-full bg-arcade-surface border-b-2 border-arcade-border flex items-center px-4 md:px-6 h-16 md:h-20 shrink-0">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="font-label-caps text-xs hidden md:inline">Home</span>
          </button>
          <div className="flex-1 flex justify-center">
            <img src="/brand/flipzy-logo-horizontal.svg" alt="Flipzy" className="h-10 md:h-14" />
          </div>
          <div className="w-20 shrink-0" />
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
          <p className="font-headline-md text-headline-md text-on-surface-variant">Subject not found</p>
          <button
            onClick={() => router.push("/home")}
            className="mt-4 h-12 px-6 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps uppercase chunky-btn border-4 border-on-primary/20"
          >
            Back to Home
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md select-none">
      {/* Header */}
      <header className="w-full bg-arcade-surface border-b-2 border-arcade-border flex justify-between items-center px-4 md:px-8 h-16 md:h-20 shrink-0 z-40 relative">
        <img
          src="/brand/flipzy-logo-horizontal.svg"
          alt="Flipzy"
          className="h-10 md:h-14"
        />
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 md:px-6 py-2 md:py-3 shadow-card-ambient text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5 active:shadow-none"
        >
          <span
            className="material-symbols-outlined text-xl md:text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
          <span className="font-label-caps text-xs md:text-label-caps">Profile</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 md:px-container-padding flex-grow pt-4 md:pt-6 pb-container-padding">
        <div className="flex flex-col items-start w-full max-w-4xl mx-auto">
          {/* Back pill */}
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant text-primary hover:bg-surface-variant transition-colors mb-4 md:mb-6 active:translate-y-0.5"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="font-label-caps text-xs hidden md:inline">Back</span>
          </button>

          {/* Subject heading */}
          <div className="flex flex-col items-center gap-3 md:gap-4 mb-6 md:mb-10 text-center w-full">
            <div
              className="w-16 h-16 md:w-22 md:h-22 rounded-full border-2 border-primary/20 flex items-center justify-center shadow-card-ambient"
              style={{ backgroundColor: subject.color }}
            >
              <span
                className="material-symbols-outlined text-3xl md:text-[44px]"
                style={{
                  fontVariationSettings: "'FILL' 1",
                  color: getIconColor(subject.color),
                }}
              >
                {subject.icon}
              </span>
            </div>
            <div>
              <h1 className="font-display-hero text-headline-lg md:text-display-hero text-primary mb-1">
                {subject.name}
              </h1>
              <p className="font-headline-md text-sm md:text-body-lg text-on-surface-variant">
                Which {subject.name.toLowerCase()} should we learn about?
              </p>
            </div>
          </div>

          {/* Topic list */}
          {topics.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">
                inventory_2
              </span>
              <p className="font-headline-md text-headline-md text-on-surface-variant">
                No topics yet
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-70 mt-2">
                Check back soon — topics are on the way!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 md:gap-4 w-full">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => router.push(`/flashcards/${topic.id}`)}
                  className="group bg-arcade-surface rounded-xl border-2 border-arcade-border border-l-4 p-3 md:p-6 flex items-center justify-between gap-3 md:gap-4 transition-all duration-200 ease-out shadow-card-ambient hover:translate-x-1 hover:shadow-card-ambient hover:border-primary/40 text-left w-full active:translate-y-0.5 active:shadow-card-ambient-active cursor-pointer"
                  style={{ borderLeftColor: subject.color }}
                >
                  <div className="flex flex-col items-start gap-0.5 md:gap-1 min-w-0">
                    <span className="font-headline-md text-sm md:text-headline-md text-on-surface truncate w-full">
                      {topic.name}
                    </span>
                    {topic.description && (
                      <span className="font-body-md text-xs md:text-body-md text-on-surface-variant opacity-80 truncate w-full">
                        {topic.description}
                      </span>
                    )}
                  </div>
                  <span className="material-symbols-outlined shrink-0 text-accent-food transition-transform duration-200 group-hover:translate-x-1">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
