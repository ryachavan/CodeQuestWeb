"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/userStore";

export default function SignupPage() {
  const router = useRouter();
  const login = useUserStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const helperText = useMemo(() => {
    if (hasSupabaseConfig) {
      return "Supabase auth is connected. Create your account with email.";
    }
    return "No Supabase keys detected. Demo auth mode is active.";
  }, []);

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          throw error;
        }

        if (data.user) {
          // Initialize profile and defaults in DB
          await Promise.all([
            supabase.from("user_profiles").insert({
              id: data.user.id,
              username: username || email.split("@")[0],
              xp: 10,
              coins: 0,
              streak: 0,
            }),
            supabase.from("user_themes").insert({
              user_id: data.user.id,
              theme_id: "neon-cyan",
            }),
            supabase.from("user_avatars").insert({
              user_id: data.user.id,
              avatar_id: "pixel-bot",
            }),
          ]);
        }

        login({ username: username || email.split("@")[0], email });
        setFeedback("Account created! Welcome to CodeQuest.");
      } else {
        const fallbackName = username || email.split("@")[0] || "Guest Coder";
        login({ username: fallbackName, email: email || null });
        setFeedback("Signed in with local demo profile.");
      }

      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      {/* Background Orbs */}
      <div className="absolute -top-36 -left-20 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 right-0 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 border-slate-700/70 relative z-10">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">CodeQuest Onboarding</p>
        <h1 className="text-3xl font-black text-white mb-2">
          Create your profile
        </h1>
        <p className="text-sm text-slate-300 mb-6">{helperText}</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-300">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="code_ninja"
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/50 transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/50 transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/50 transition-colors"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3.5 transition-colors disabled:opacity-60 shadow-lg shadow-cyan-500/20"
          >
            {isSubmitting ? "Generating profile..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            Already have an account? Sign in
          </Link>

          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2">
            <Lock size={14} />
            Back to home
          </Link>
        </div>

        {feedback && (
          <p className="mt-6 text-sm rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-slate-200">
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}
