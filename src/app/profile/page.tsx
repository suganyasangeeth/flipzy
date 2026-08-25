"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface KidProfile {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<KidProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const { data } = await supabase
        .from("kid_accounts")
        .select("id, name, avatar, email, created_at")
        .eq("email", user.email)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Profile not found.</p>
      </div>
    );
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md">
      {/* Header */}
      <header className="w-full bg-arcade-surface border-b-2 border-arcade-border flex items-center px-4 md:px-8 h-16 md:h-20 shrink-0">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-primary hover:text-primary-container transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-caps text-xs md:text-label-caps">Home</span>
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 md:px-container-padding pt-8 md:pt-12 pb-container-padding">
        <div className="w-full max-w-md">
          <div className="bg-arcade-surface border-2 border-arcade-border border-l-4 border-l-primary rounded-2xl p-card-padding arcade-card space-y-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full bg-secondary-fixed border-4 border-primary overflow-hidden shadow-chunky-primary flex items-center justify-center transition-transform duration-200 hover:scale-105 cursor-pointer">
                <span
                  className="material-symbols-outlined text-6xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  face
                </span>
              </div>
              <h1 className="font-display-hero text-headline-lg text-primary text-center">
                {profile.name}
              </h1>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant">Email</label>
                <p className="font-body-lg text-body-lg text-on-surface mt-1">{profile.email}</p>
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant">Member Since</label>
                <p className="font-body-lg text-body-lg text-on-surface mt-1">{joinedDate}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 rounded-xl chunky-btn uppercase border-4 border-on-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
