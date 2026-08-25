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

const AVATAR_OPTIONS = [
  "face",
  "mood",
  "sentiment_very_satisfied",
  "sports_esports",
  "science",
  "palette",
  "music_note",
  "star",
  "auto_awesome",
  "local_fire_department",
  "rocket_launch",
  "psychology",
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<KidProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("face");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

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

      if (data) {
        setProfile(data);
        setEditName(data.name);
        setEditAvatar(data.avatar || "face");
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleSave() {
    if (!profile || !editName.trim()) return;
    setSaving(true);
    setMsg("");

    const { error } = await supabase
      .from("kid_accounts")
      .update({ name: editName.trim(), avatar: editAvatar })
      .eq("id", profile.id);

    if (error) {
      setMsg("Failed to save. Try again.");
    } else {
      setProfile({ ...profile, name: editName.trim(), avatar: editAvatar });
      setEditing(false);
      setMsg("Profile updated!");
      setTimeout(() => setMsg(""), 2000);
    }
    setSaving(false);
  }

  function cancelEdit() {
    if (profile) {
      setEditName(profile.name);
      setEditAvatar(profile.avatar || "face");
    }
    setEditing(false);
    setMsg("");
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

  const displayAvatar = editing ? editAvatar : (profile.avatar || "face");

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
              <div
                className={`w-28 h-28 rounded-full bg-secondary-fixed border-4 border-primary overflow-hidden shadow-chunky-primary flex items-center justify-center ${editing ? "cursor-pointer transition-transform duration-200 hover:scale-105" : ""}`}
                onClick={() => {
                  if (editing) {
                    const idx = AVATAR_OPTIONS.indexOf(displayAvatar);
                    setEditAvatar(AVATAR_OPTIONS[(idx + 1) % AVATAR_OPTIONS.length]);
                  }
                }}
              >
                <span
                  className="material-symbols-outlined text-6xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {displayAvatar}
                </span>
              </div>
              {editing && (
                <p className="font-label-caps text-xs text-on-surface-variant -mt-2">
                  Tap avatar to cycle
                </p>
              )}

              {editing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="font-display-hero text-headline-lg text-primary text-center bg-transparent border-b-2 border-primary focus:outline-none w-full max-w-[250px]"
                  autoFocus
                />
              ) : (
                <h1 className="font-display-hero text-headline-lg text-primary text-center">
                  {profile.name}
                </h1>
              )}
            </div>

            {/* Avatar picker grid (edit mode) */}
            {editing && (
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Choose Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setEditAvatar(icon)}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center border-2 transition-all ${
                        editAvatar === icon
                          ? "border-primary bg-primary/10 scale-110"
                          : "border-outline-variant bg-surface-container-lowest hover:border-primary/40"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-2xl text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* Status message */}
            {msg && (
              <p className="text-center font-label-caps text-sm text-primary">{msg}</p>
            )}

            {/* Actions */}
            {editing ? (
              <div className="flex gap-3">
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-surface-container-highest text-on-surface font-label-caps text-label-caps py-4 rounded-xl uppercase border-2 border-outline-variant flex items-center justify-center gap-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editName.trim()}
                  className="flex-1 bg-primary text-on-primary font-label-caps text-label-caps py-4 rounded-xl chunky-btn uppercase border-4 border-on-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="w-full bg-surface-container-highest text-primary font-label-caps text-label-caps py-4 rounded-xl uppercase border-2 border-outline-variant flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">edit</span>
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 rounded-xl chunky-btn uppercase border-4 border-on-primary/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
