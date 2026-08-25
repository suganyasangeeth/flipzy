"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
}

const FALLBACK_SUBJECTS: Subject[] = [
  { id: "1", name: "Animals", color: "#ffdbca", icon: "cruelty_free", order: 1 },
  { id: "2", name: "Food", color: "#ffdad6", icon: "restaurant", order: 2 },
  { id: "3", name: "Emotions", color: "#e9ddff", icon: "mood", order: 3 },
  { id: "4", name: "Science", color: "#d8e3fb", icon: "science", order: 4 },
  { id: "5", name: "Family", color: "#8cfa9f", icon: "family_home", order: 5 },
  { id: "6", name: "Colors", color: "#dee8ff", icon: "palette", order: 6 },
];

function getIconColor(bgHex: string): string {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#111c2d" : "#ffffff";
}

export default function HomePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>(FALLBACK_SUBJECTS);

  useEffect(() => {
    async function fetchSubjects() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: kid } = await supabase
        .from("kid_accounts")
        .select("id")
        .eq("email", user.email)
        .single();

      const { data } = await supabase
        .from("subjects")
        .select("id, name, color, icon, order")
        .eq("visible", true)
        .order("order", { ascending: true });

      if (!data || data.length === 0) return;

      if (kid) {
        const { data: hidden } = await supabase
          .from("kid_subject_visibility")
          .select("subject_id")
          .eq("kid_id", kid.id)
          .eq("visible", false);

        if (hidden && hidden.length > 0) {
          const hiddenIds = new Set(hidden.map((h) => h.subject_id));
          const filtered = data.filter((s) => !hiddenIds.has(s.id));
          setSubjects(filtered.length > 0 ? filtered : FALLBACK_SUBJECTS);
          return;
        }
      }

      setSubjects(data);
    }
    fetchSubjects();
  }, []);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-display-hero select-none">
      <header className="w-full absolute top-0 z-40 bg-transparent flex justify-between items-center px-4 md:px-8 h-16 md:h-20">
        <img
          src="/brand/flipzy-logo-horizontal.svg"
          alt="Flipzy"
          className="h-8 md:h-12"
        />
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 md:px-6 py-2 md:py-3 shadow-arcade-ambient text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5 active:shadow-card-ambient-active"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            person
          </span>
          <span className="font-label-caps text-xs md:text-label-caps">Profile</span>
        </button>
      </header>

      <main className="w-full px-4 md:px-container-padding flex-grow flex items-center justify-center pt-20 md:pt-24 pb-container-padding">
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-1 md:gap-2 mb-4 md:mb-8 text-center">
            <h1 className="font-display-hero text-headline-md md:text-headline-lg text-primary">
              Hi there
            </h1>
            <p className="font-headline-md text-sm md:text-body-lg text-on-surface-variant">
              Pick a subject to start learning
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => router.push(`/subjects/${subject.id}`)}
                className="bg-arcade-surface rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-6 aspect-square transition-transform duration-100 ease-in-out shadow-card-ambient active:translate-y-0.5 active:shadow-card-ambient-active"
              >
                <div
                  className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: subject.color }}
                >
                  <span
                    className="material-symbols-outlined text-4xl md:text-[56px]"
                    style={{
                      fontVariationSettings: "'FILL' 1",
                      color: getIconColor(subject.color),
                    }}
                  >
                    {subject.icon}
                  </span>
                </div>
                <span className="font-headline-md text-sm md:text-headline-md text-on-surface">
                  {subject.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
