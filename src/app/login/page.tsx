"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Code2, Mail, Lock } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/userStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useUserStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const helperText = useMemo(() => {
    if (hasSupabaseConfig) {
      return "Supabase auth is connected. Use your email to sign in.";
    }
    return "No Supabase keys detected. Demo auth mode is active.";
  }, []);

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password");
          }
          throw error;
        }
        const username = email.split("@")[0] || "User";
        login({ username, email });
      } else {
        const fallbackName = email.split("@")[0] || "Guest Coder";
        login({ username: fallbackName, email: email || null });
        setFeedback("Signed in with local demo profile.");
      }

      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 border-slate-700/70">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">CodeQuest Auth</p>
        <h1 className="text-3xl font-black text-white mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-slate-300 mb-6">{helperText}</p>

        <form onSubmit={handleEmailAuth} className="space-y-3">


          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/50"
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
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400/50"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : "Sign in"}
          </button>
        </form>


        <Link
          href="/signup"
          className="mt-4 block text-sm text-cyan-300 hover:text-cyan-200"
        >
          No account? Create one
        </Link>

        {feedback && (
          <p className="mt-4 text-sm rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-slate-200">
            {feedback}
          </p>
        )}

        <Link href="/" className="mt-5 block text-sm text-slate-400 hover:text-slate-200">
          Back to home
        </Link>
      </div>
    </div>
  );
}
