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

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-container-padding font-body-md text-on-surface">
      <main className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/brand/flipzy-logo-primary.svg"
            alt="Flipzy"
            className="h-20 md:h-24 mx-auto"
          />
          <p className="font-label-caps text-label-caps text-on-surface-variant mt-2">
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
        <div className="bg-arcade-surface rounded-xl arcade-card p-card-padding relative overflow-hidden">
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

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-tertiary opacity-30 hidden md:block">
          <span
            className="material-symbols-outlined text-6xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        </div>
        <div className="absolute bottom-10 right-10 text-secondary-container opacity-30 hidden md:block">
          <span
            className="material-symbols-outlined text-6xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            sports_esports
          </span>
        </div>
      </main>
    </div>
  );
}
