"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const AVATAR_COLORS = [
  "border-accent-objects",
  "border-tertiary-container",
  "border-accent-space",
  "border-secondary-container",
  "border-primary",
];

export default function KidsListPage() {
  const router = useRouter();
  const [kids, setKids] = useState<KidAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKids();
  }, []);

  async function fetchKids() {
    const { data } = await supabase
      .from("kid_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setKids(data);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* Sidebar */}
      <nav className="hidden md:flex flex-col h-screen p-unit gap-stack-gap bg-arcade-surface w-72 border-r-4 border-primary shrink-0 z-40 relative">
        <div className="px-gutter pt-4 pb-2 border-b-2 border-outline-variant/30 mb-4">
          <h1 className="font-headline-lg text-headline-lg text-primary uppercase text-center mb-1">
            Admin Panel
          </h1>
        </div>
        <ul className="flex-1 flex flex-col gap-2 font-label-caps text-label-caps px-4">
          <li>
            <a
              className="flex items-center gap-3 p-3 rounded-xl text-on-surface-variant hover:text-primary hover:translate-x-1 transition-transform"
              href="/admin"
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                menu_book
              </span>
              Subjects
            </a>
          </li>
          <li>
            <a
              className="flex items-center gap-3 p-3 bg-primary text-on-primary rounded-xl shadow-chunky-primary active:scale-95 duration-100"
              href="/admin/kids"
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                child_care
              </span>
              Kid Accounts
            </a>
          </li>
        </ul>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
        <header className="flex justify-between items-center p-8 bg-surface border-b-2 border-primary/20 shrink-0">
          <h2 className="font-display-hero text-display-hero text-on-background">
            Kid Accounts Explorer
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-primary hover:text-primary-container font-label-caps transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                logout
              </span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="arcade-card p-card-padding">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-lg text-headline-lg text-primary">
                Active Roster
              </h3>
              <span />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-outline-variant font-label-caps text-label-caps text-on-surface-variant">
                    <th className="py-4 px-4">Kid</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Last Login</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md">
                  {loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-on-surface-variant"
                      >
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loading && kids.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-on-surface-variant"
                      >
                        No kid accounts yet.
                      </td>
                    </tr>
                  )}
                  {kids.map((kid, i) => (
                    <tr
                      key={kid.id}
                      className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="py-4 px-4 flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full border-2 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} overflow-hidden shadow-sm bg-white p-1 flex items-center justify-center`}
                        >
                          <span
                            className="material-symbols-outlined text-3xl text-on-surface-variant"
                            style={{
                              fontVariationSettings: "'FILL' 1",
                            }}
                          >
                            face
                          </span>
                        </div>
                        <span className="font-headline-md text-headline-md text-on-surface">
                          {kid.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant">
                        {kid.email}
                      </td>
                      <td className="py-4 px-4">
                        {kid.status === "active" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-xs border border-tertiary-container">
                            <span
                              className="material-symbols-outlined text-sm"
                              style={{
                                fontVariationSettings: "'FILL' 1",
                              }}
                            >
                              check_circle
                            </span>{" "}
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-caps text-xs border border-error">
                            <span
                              className="material-symbols-outlined text-sm"
                              style={{
                                fontVariationSettings: "'FILL' 1",
                              }}
                            >
                              block
                            </span>{" "}
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant">
                        {timeAgo(kid.last_login)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => router.push(`/admin/kids/${kid.id}`)}
                          className="chunky-btn px-4 py-2 text-xs"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
