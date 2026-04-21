"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Swords, Trophy, User } from "lucide-react";
import { useUserStore } from "@/store/userStore";

const stats = [
  { label: "Active learners", value: "42K+" },
  { label: "Lessons completed", value: "1.2M" },
  { label: "Daily streaks", value: "87%" },
];

const features = [
  {
    icon: Swords,
    title: "Bite-sized battles",
    description: "Multiple choice, drag-style code assembly, and fill-in coding drills.",
  },
  {
    icon: Trophy,
    title: "XP and coin economy",
    description: "Earn rewards, unlock profile cosmetics, and climb weekly leaderboards.",
  },
  {
    icon: Sparkles,
    title: "Streak-focused gameplay",
    description: "Daily quests and momentum tracking make consistent practice addictive.",
  },
];

export default function Home() {
  const { isAuthenticated } = useUserStore();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-36 -left-20 w-96 h-96 rounded-full bg-cyan-400/14 blur-3xl pointer-events-none" />
      <div className="absolute top-16 right-0 w-96 h-96 rounded-full bg-emerald-400/12 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 left-1/3 w-[28rem] h-[28rem] rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

      {/* Navbar */}
      <header className="relative z-50 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center p-1.5">
            <Sparkles className="text-white h-full w-full" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">CodeQuest</span>
        </div>
        
        <Link
          href={isAuthenticated ? "/dashboard" : "/login"}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-sm font-bold text-slate-100 hover:bg-slate-800 transition-colors"
        >
          {isAuthenticated ? (
            <>
              Dashboard
              <ArrowRight size={14} />
            </>
          ) : (
            <>
              <User size={14} />
              Login
            </>
          )}
        </Link>
      </header>

      <main className="max-w-6xl mx-auto relative z-10 px-6 py-10 md:py-8">
        <section className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300 border border-cyan-400/30 bg-cyan-500/10 rounded-full px-3 py-1.5 mb-5">
              <Sparkles size={14} />
              Gamified Coding Platform
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tight">
              Learn Programming
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300">
                Like an Epic Quest
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mt-6 max-w-2xl">
              Master C, C++, Python, and HTML with animated lessons, live progress,
              and reward loops inspired by top game mechanics.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-extrabold hover:bg-cyan-400 transition-colors shadow-[0_0_24px_rgba(6,182,212,0.35)]"
              >
                Get Started Now
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stats.map((item) => (
                <div key={item.label} className="glass-panel rounded-xl p-4 border-slate-700/70">
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400 mt-1">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="glass-panel rounded-3xl p-6 border-cyan-400/20 neon-outline"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-3">Session Preview</p>
            <div className="rounded-2xl border border-slate-700 bg-slate-950/90 p-4">
              <div className="flex justify-between text-sm text-slate-300 mb-3">
                <span>Python Foundations</span>
                <span>2/3 questions</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-cyan-400"
                  initial={{ width: "0%" }}
                  animate={{ width: "68%" }}
                  transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <h3 className="font-black text-white mb-2">Assemble the correct output line</h3>
              <div className="flex flex-wrap gap-2">
                <Token>print(</Token>
                <Token>&quot;Hello&quot;</Token>
                <Token>)</Token>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-14 grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
                className="glass-panel rounded-2xl p-5 border-slate-700/70"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/14 text-cyan-300 flex items-center justify-center mb-3">
                  <Icon size={20} />
                </div>
                <h2 className="text-xl font-black text-white mb-2">{feature.title}</h2>
                <p className="text-slate-300 text-sm">{feature.description}</p>
              </motion.article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

function Token({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1.5 rounded-md border border-cyan-400/40 bg-cyan-500/10 text-cyan-100 font-mono text-sm">
      {children}
    </span>
  );
}
