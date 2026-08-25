"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type RoleTab = "user" | "admin";
type UserMode = "login" | "signup";

export default function LoginPage() {
  const [role, setRole] = useState<RoleTab>("user");
  const [mode, setMode] = useState<UserMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (role === "user" && mode === "signup") {
        let res: Response;
        try {
          res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });
        } catch {
          setError("Network error — please try again.");
          setLoading(false);
          return;
        }

        let data: { error?: string };
        try {
          data = await res.json();
        } catch {
          setError("Unexpected response from server.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError(data.error || "Signup failed.");
          setLoading(false);
          return;
        }
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setLoading(false);

      const { data: isAdmin } = await supabase.rpc("is_admin");
      router.push(isAdmin ? "/admin" : "/home");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  }

  const bgIcons = [
    { icon: "cruelty_free", top: "8%", left: "5%", delay: "0s", size: "text-[90px] md:text-[130px]" },
    { icon: "restaurant", top: "15%", right: "8%", delay: "1.5s", size: "text-[80px] md:text-[110px]" },
    { icon: "science", bottom: "20%", left: "10%", delay: "3s", size: "text-[70px] md:text-[100px]" },
    { icon: "mood", bottom: "10%", right: "5%", delay: "0.8s", size: "text-[85px] md:text-[120px]" },
    { icon: "palette", top: "55%", left: "3%", delay: "2.2s", size: "text-[60px] md:text-[90px]" },
    { icon: "family_home", top: "45%", right: "3%", delay: "4s", size: "text-[65px] md:text-[95px]" },
  ];

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-container-padding font-body-md text-on-surface relative overflow-hidden">
      {/* Floating background icons */}
      <div className="fixed inset-0 pointer-events-none z-0">
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
              animation: "gentle-drift 10s ease-in-out infinite",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            {item.icon}
          </span>
        ))}
      </div>

      <main className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-10">
          <img
            src="/brand/flipzy-logo-primary.svg"
            alt="Flipzy"
            className="h-20 md:h-36 mx-auto"
          />
          <p className="font-label-caps text-xs md:text-label-caps text-on-surface-variant mt-3">
            {role === "admin" ? "Admin Portal" : "Kid Login"}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-3 mb-stack-gap">
          <button
            type="button"
            onClick={() => {
              setRole("user");
              resetForm();
            }}
            className={`flex-1 py-3 rounded-xl font-label-caps text-label-caps uppercase transition-all border-2 ${
              role === "user"
                ? "bg-accent-food text-on-primary border-accent-food shadow-chunky-primary active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                : "bg-surface-container-highest text-on-surface border-outline-variant hover:border-accent-food"
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("admin");
              setMode("login");
              resetForm();
            }}
            className={`flex-1 py-3 rounded-xl font-label-caps text-label-caps uppercase transition-all border-2 ${
              role === "admin"
                ? "bg-accent-food text-on-primary border-accent-food shadow-chunky-primary active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                : "bg-surface-container-highest text-on-surface border-outline-variant hover:border-accent-food"
            }`}
          >
            Login as Admin
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-arcade-surface rounded-xl arcade-card p-card-padding relative overflow-hidden border-l-4 border-primary">
          {/* Decorative accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent-objects rounded-bl-full opacity-20" />

          {/* Sub-toggle for user mode */}
          {role === "user" && (
            <div className="flex gap-2 mb-stack-gap">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  resetForm();
                }}
                className={`flex-1 py-2 rounded-lg font-label-caps text-sm uppercase transition-all ${
                  mode === "login"
                    ? "bg-accent-food text-on-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  resetForm();
                }}
                className={`flex-1 py-2 rounded-lg font-label-caps text-sm uppercase transition-all ${
                  mode === "signup"
                    ? "bg-accent-food text-on-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <h2 className="font-headline-lg text-headline-lg text-center mb-stack-gap text-on-surface">
            {role === "admin"
              ? "Welcome Back"
              : mode === "signup"
                ? "Create Account"
                : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-stack-gap relative z-10">
            {/* Name field — signup only */}
            {role === "user" && mode === "signup" && (
              <div>
                <label
                  className="block font-label-caps text-label-caps text-on-surface mb-unit"
                  htmlFor="name"
                >
                  Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      person
                    </span>
                  </span>
                  <input
                    className="w-full pl-10 pr-3 py-3 rounded-lg border-2 border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-0 transition-colors font-body-md"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                className="block font-label-caps text-label-caps text-on-surface mb-unit"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    mail
                  </span>
                </span>
                <input
                  className="w-full pl-10 pr-3 py-3 rounded-lg border-2 border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-0 transition-colors font-body-md"
                  id="email"
                  name="email"
                  placeholder={
                    role === "admin" ? "admin@flipzy.edu" : "you@example.com"
                  }
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block font-label-caps text-label-caps text-on-surface mb-unit"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                </span>
                <input
                  className="w-full pl-10 pr-3 py-3 rounded-lg border-2 border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-0 transition-colors font-body-md"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-error font-label-caps text-sm text-center">
                {error}
              </p>
            )}

            {/* Submit */}
            <div className="pt-unit">
              <button
                className="w-full bg-accent-food text-on-primary font-label-caps text-label-caps py-4 rounded-xl chunky-btn uppercase border-2 border-on-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ '--tw-shadow-color': '#8B1717' } as React.CSSProperties}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : role === "admin"
                    ? "Login"
                    : mode === "signup"
                      ? "Sign Up"
                      : "Login"}
                {!loading && (
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Forgot Password — login mode only */}
          {mode === "login" && (
            <div className="mt-6 text-center">
              <a
                className="font-body-md text-body-md text-primary hover:text-primary-container transition-colors font-bold"
                href="#"
              >
                Forgot Password?
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
