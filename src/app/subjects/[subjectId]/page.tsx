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
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Subject not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md select-none">
      {/* Header */}
      <header className="w-full absolute top-0 z-40 bg-transparent flex justify-between items-center px-8 h-24">
        <img
          src="/brand/flipzy-logo-horizontal.svg"
          alt="Flipzy"
          className="h-10"
        />
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 bg-surface-container-highest rounded-full px-6 py-3 shadow-arcade-ambient text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5 active:shadow-none"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
          <span className="font-label-caps text-label-caps">Profile</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full px-container-padding flex-grow flex items-center justify-center pt-24 pb-container-padding">
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
          {/* Back arrow */}
          <div className="w-full mb-4">
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 text-primary hover:text-primary-container transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-label-caps text-label-caps">Back</span>
            </button>
          </div>

          {/* Subject heading */}
          <div className="flex flex-col items-center gap-3 mb-8 text-center">
            <div
              className="w-20 h-20 rounded-2xl border-2 border-primary flex items-center justify-center"
              style={{ backgroundColor: subject.color }}
            >
              <span
                className="material-symbols-outlined text-[48px]"
                style={{
                  fontVariationSettings: "'FILL' 1",
                  color: getIconColor(subject.color),
                }}
              >
                {subject.icon}
              </span>
            </div>
            <h1 className="font-display-hero text-headline-lg text-primary uppercase font-black">
              {subject.name}
            </h1>
            <p className="font-headline-md text-body-lg text-on-surface-variant">
              Which {subject.name.toLowerCase()} should we learn about?
            </p>
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
            <div className="flex flex-col gap-6 w-full">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => router.push(`/flashcards/${topic.id}`)}
                  className="bg-arcade-surface rounded-2xl border-2 border-primary p-8 flex items-center justify-between gap-4 transition-transform duration-100 ease-in-out shadow-card-ambient hover:-translate-y-1 text-left w-full active:translate-y-0.5 active:shadow-card-ambient-active"
                >
                  <div className="flex flex-col items-start gap-2">
                    <span
                      className="font-headline-md text-headline-md text-on-surface"
                    >
                      {topic.name}
                    </span>
                    {topic.description && (
                      <span className="font-body-md text-body-md text-on-surface-variant opacity-80">
                        {topic.description}
                      </span>
                    )}
                  </div>
                  <span
                    className="material-symbols-outlined shrink-0 text-accent-food"
                  >
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

function getIconColor(bgHex: string): string {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#111c2d" : "#ffffff";
}
