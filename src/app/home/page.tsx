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
  return luminance > 0.5 ? "#071B37" : "#ffffff";
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

  const bgIcons = [
    { icon: "cruelty_free", top: "8%", left: "5%", delay: "0s", size: "text-[100px] md:text-[140px]" },
    { icon: "restaurant", top: "60%", right: "3%", delay: "2s", size: "text-[90px] md:text-[120px]" },
    { icon: "science", bottom: "15%", left: "8%", delay: "4s", size: "text-[80px] md:text-[110px]" },
    { icon: "palette", top: "25%", right: "10%", delay: "1s", size: "text-[70px] md:text-[100px]" },
  ];

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-display-hero select-none">
      {/* Floating background icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {bgIcons.map((item, i) => (
          <span
            key={i}
            className={`material-symbols-outlined absolute ${item.size} text-primary/[0.04]`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
              animationDelay: item.delay,
              animation: "gentle-float 8s ease-in-out infinite",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            {item.icon}
          </span>
        ))}
      </div>

      {/* Header */}
      <header className="w-full bg-arcade-surface border-b-2 border-arcade-border flex justify-between items-center px-4 md:px-8 h-16 md:h-20 shrink-0 z-40 relative">
        <img
          src="/brand/flipzy-logo-horizontal.svg"
          alt="Flipzy"
          className="h-10 md:h-14"
        />
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 bg-surface-container-highest rounded-full px-4 md:px-6 py-2 md:py-3 shadow-card-ambient text-primary hover:bg-surface-variant transition-colors active:translate-y-0.5 active:shadow-card-ambient-active"
        >
          <span className="material-symbols-outlined text-xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            person
          </span>
          <span className="font-label-caps text-xs md:text-label-caps">Profile</span>
        </button>
      </header>

      <main className="w-full px-4 md:px-container-padding flex-grow flex items-start justify-center pt-6 md:pt-10 pb-container-padding relative z-10">
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
          {/* Hero */}
          <div className="flex flex-col items-center gap-1 mb-6 md:mb-10 text-center">
            <h1 className="font-display-hero text-headline-lg md:text-display-hero text-primary">
              Hi there 👋
            </h1>
            <p className="font-headline-md text-sm md:text-body-lg text-on-surface-variant">
              Pick a subject to start learning
            </p>
          </div>

          {/* Subject grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 w-full">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => router.push(`/subjects/${subject.id}`)}
                className="group bg-arcade-surface rounded-2xl border-2 border-arcade-border py-5 md:py-7 px-3 flex flex-col items-center justify-center gap-2 md:gap-4 transition-all duration-200 ease-out shadow-card-ambient hover:-translate-y-1 hover:shadow-arcade-card hover:border-primary/30 active:translate-y-0.5 active:shadow-card-ambient-active cursor-pointer"
              >
                <div
                  className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:ring-2 group-hover:ring-primary/20"
                  style={{ backgroundColor: subject.color }}
                >
                  <span
                    className="material-symbols-outlined text-3xl md:text-[48px]"
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
