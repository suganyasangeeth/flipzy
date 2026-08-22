"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface KidAccount {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  status: string;
  last_login: string | null;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

function fmtDate(d: string | null) {
  if (!d) return "Never";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KidDetailPage() {
  const router = useRouter();
  const params = useParams();
  const kidId = params.id as string;

  const [kid, setKid] = useState<KidAccount | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [vis, setVis] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [delStep, setDelStep] = useState(0);

  useEffect(() => {
    if (!kidId) return;
    load();
  }, [kidId]);

  async function load() {
    const { data: k } = await supabase
      .from("kid_accounts")
      .select("*")
      .eq("id", kidId)
      .single();
    if (k) {
      setKid(k);
      setName(k.name);
      setEmail(k.email);
    }
    const { data: s } = await supabase
      .from("subjects")
      .select("id,name,color,icon")
      .order("order", { ascending: true });
    if (s) setSubjects(s);
    const { data: v } = await supabase
      .from("kid_subject_visibility")
      .select("subject_id,visible")
      .eq("kid_id", kidId);
    if (v) {
      const m: Record<string, boolean> = {};
      v.forEach((r: { subject_id: string; visible: boolean }) => {
        m[r.subject_id] = r.visible;
      });
      setVis(m);
    }
    const authRes = await fetch(`/api/admin/kid-auth?id=${kidId}`);
    if (authRes.ok) {
      const authData = await authRes.json();
      setEmailConfirmed(authData.email_confirmed_at);
    }
  }

  async function saveName() {
    setSaving(true);
    setMsg("");
    const { error } = await supabase
      .from("kid_accounts")
      .update({ name })
      .eq("id", kidId);
    setSaving(false);
    if (error) setMsg(error.message);
    else {
      if (kid) setKid({ ...kid, name });
      setMsg("Name saved.");
    }
  }

  async function saveEmail() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/kid-auth", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kidId, email }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMsg(data.error || "Failed to update email");
    } else {
      if (kid) setKid({ ...kid, email });
      setMsg("Email saved. Auth and kid_accounts are in sync.");
    }
  }

  async function toggleVis(subjectId: string) {
    const cur = vis[subjectId] ?? true;
    const next = !cur;
    setVis((p) => ({ ...p, [subjectId]: next }));

    if (next) {
      const { error } = await supabase
        .from("kid_subject_visibility")
        .delete()
        .eq("kid_id", kidId)
        .eq("subject_id", subjectId);
      if (error) {
        setVis((p) => ({ ...p, [subjectId]: cur }));
        setMsg(error.message);
      }
    } else {
      const { error } = await supabase
        .from("kid_subject_visibility")
        .upsert(
          { kid_id: kidId, subject_id: subjectId, visible: false },
          { onConflict: "kid_id,subject_id" }
        );
      if (error) {
        setVis((p) => ({ ...p, [subjectId]: cur }));
        setMsg(error.message);
      }
    }
  }

  async function toggleSuspend() {
    if (!kid) return;
    const ns = kid.status === "active" ? "suspended" : "active";
    const { error } = await supabase
      .from("kid_accounts")
      .update({ status: ns })
      .eq("id", kidId);
    if (error) setMsg(error.message);
    else setKid({ ...kid, status: ns });
  }

  async function sendReset() {
    setMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setMsg(error ? error.message : "Password reset email sent.");
  }

  async function deleteAccount() {
    const { error } = await supabase
      .from("kid_accounts")
      .delete()
      .eq("id", kidId);
    if (error) setMsg(error.message);
    else router.push("/admin/kids");
  }

  if (!kid) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      <nav className="hidden md:flex flex-col h-screen p-unit gap-stack-gap bg-arcade-surface w-72 border-r-4 border-primary shrink-0 sticky top-0">
        <div className="px-gutter pt-4 pb-2 border-b-2 border-outline-variant/30 mb-4">
          <h1 className="font-headline-lg text-headline-lg text-primary uppercase text-center">
            Admin Panel
          </h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant opacity-70 mt-1 text-center">
            Manage Flipzy Content
          </p>
        </div>
        <nav className="flex-1 flex flex-col gap-2 mt-4 px-2">
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-label-caps text-label-caps text-on-surface-variant hover:text-primary hover:translate-x-1 transition-transform"
            href="/admin"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            Subjects
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-label-caps text-label-caps bg-primary text-on-primary shadow-chunky-primary active:scale-95"
            href="/admin/kids"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>child_care</span>
            Kid Accounts
          </a>
        </nav>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="hidden md:flex items-center justify-end px-gutter w-full sticky top-0 z-50 h-20 border-b-4 border-primary bg-arcade-surface shadow-chunky-primary">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
            className="flex items-center gap-2 px-4 py-2 font-label-caps text-label-caps text-primary hover:bg-surface-variant transition-colors rounded-lg"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.push("/admin/kids")}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-arcade-surface border-2 border-primary text-primary chunky-btn"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="font-display-hero text-headline-lg md:text-display-hero text-on-surface">
                Manage {kid.name}
              </h2>
            </div>

            <div className="bg-arcade-surface border-2 border-primary rounded-2xl p-card-padding arcade-card relative z-10 space-y-8">
              {/* Profile */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b-2 border-outline-variant/30">
                <div className="w-24 h-24 rounded-full bg-secondary-fixed border-4 border-primary overflow-hidden shrink-0 shadow-chunky-primary relative group cursor-pointer flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>face</span>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white">edit</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <label className="font-label-caps text-label-caps text-on-surface-variant">Kid Name</label>
                  <div className="flex gap-3">
                    <input
                      className="flex-1 h-14 px-4 rounded-xl border-2 border-primary bg-surface font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/20"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <button onClick={saveName} disabled={saving} className="h-14 px-6 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps uppercase border-4 border-white chunky-btn shrink-0">
                      {saving ? "..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col md:flex-row items-end gap-4 pb-8 border-b-2 border-outline-variant/30">
                <div className="flex-1 space-y-2 w-full">
                  <label className="font-label-caps text-label-caps text-on-surface-variant">Email</label>
                  <input
                    className="w-full h-14 px-4 rounded-xl border-2 border-primary bg-surface font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/20"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button onClick={saveEmail} disabled={saving} className="h-14 px-8 rounded-xl bg-primary text-on-primary font-label-caps text-label-caps uppercase border-4 border-white chunky-btn shrink-0 w-full md:w-auto">
                  Save Email
                </button>
              </div>

              {/* Subject Visibility */}
              <div className="pb-8 border-b-2 border-outline-variant/30">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Subject Visibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {subjects.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border-2 border-arcade-border bg-surface shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "40" }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                        </div>
                        <span className="font-body-lg text-body-lg">{s.name}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={vis[s.id] ?? true}
                          onChange={() => toggleVis(s.id)}
                        />
                        <div className="w-14 h-7 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-tertiary-fixed-dim border-2 border-tertiary" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Actions */}
              <div className="pb-8 border-b-2 border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">Email Status:</span>
                    <span className={`px-3 py-1 font-label-caps text-label-caps rounded-full border-2 text-sm ${emailConfirmed ? "bg-tertiary-fixed-dim text-on-tertiary-fixed-variant border-tertiary" : "bg-outline-variant/30 text-on-surface-variant border-outline-variant"}`}>
                      {emailConfirmed ? "Verified" : "Not verified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">Last Login:</span>
                    <span className="font-body-md text-body-md">{fmtDate(kid.last_login)}</span>
                  </div>
                </div>
                <button onClick={sendReset} className="h-14 px-8 rounded-xl bg-accent-objects text-on-surface font-label-caps text-label-caps uppercase border-4 border-white shadow-chunky-primary hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all w-full md:w-auto flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">key</span>
                  Send Reset Link
                </button>
              </div>

              {/* Danger Zone */}
              <div className="bg-error-container/30 border-2 border-error/20 rounded-xl p-6">
                <h3 className="font-headline-md text-headline-md text-error mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  Danger Zone
                </h3>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="font-body-lg text-body-lg">Account Status</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={kid.status === "active"}
                        onChange={toggleSuspend}
                      />
                      <div className="w-14 h-7 bg-error rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-tertiary-fixed-dim border-2 border-on-surface/50" />
                    </label>
                    <span className={`font-label-caps text-label-caps ${kid.status === "active" ? "text-tertiary" : "text-error"}`}>
                      {kid.status === "active" ? "Active" : "Suspended"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {delStep === 0 ? (
                      <button onClick={() => setDelStep(1)} className="h-14 px-8 rounded-xl bg-error text-on-error font-label-caps text-label-caps uppercase border-4 border-white chunky-btn w-full md:w-auto">
                        Delete Account
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-error font-label-caps">Are you sure?</span>
                        <button onClick={deleteAccount} className="h-10 px-4 rounded-xl bg-error text-on-error font-label-caps text-label-caps text-sm border-2 border-on-error/20">
                          Yes, Delete
                        </button>
                        <button onClick={() => setDelStep(0)} className="h-10 px-4 rounded-xl border-2 border-outline-variant font-label-caps text-label-caps text-sm">
                          Cancel
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-on-surface-variant">This action cannot be undone.</p>
                  </div>
                </div>
              </div>
            </div>

            {msg && (
              <p className="mt-4 text-center font-label-caps text-label-caps text-primary">{msg}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
