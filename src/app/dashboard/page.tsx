"use client";

import Link from "next/link";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Crown, Sparkles, Target } from "lucide-react";
import {
  fetchDailyQuests,
  fetchLanguageProgress,
  fetchLanguages,
  fetchRecommendedLesson,
} from "@/lib/dataApi";
import { languageUi } from "@/lib/languageUi";
import { useUserStore } from "@/store/userStore";

const languageIcons = {
  python: "Py",
  c: "C",
  cpp: "C++",
  html: "HTML",
} as const;

const lessonPrefixMap = {
  python: "py-",
  c: "c-",
  cpp: "cpp-",
  html: "html-",
} as const;

export default function Dashboard() {
  const { xp, level, streak, completedLessons, claimedQuestIds } = useUserStore();

  const { data: langs, isLoading: langsLoading } = useSWR("languages", fetchLanguages);
  const { data: quests } = useSWR("daily-quests", fetchDailyQuests);

  const activeQuestCount =
    quests?.filter((quest) => !claimedQuestIds.includes(quest.id)).length ?? 0;

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-3xl p-6 md:p-8 border-slate-700/70 relative overflow-hidden">
        <div className="absolute -top-24 -right-10 w-64 h-64 rounded-full accent-bg blur-3xl opacity-20" />
        <div className="absolute -bottom-32 left-12 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 grid md:grid-cols-[2fr_1fr] gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] accent-text mb-2">Daily Control Deck</p>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
              Keep your coding streak alive and unlock your next quest.
            </h1>
            <p className="text-slate-300 max-w-xl">
              CodeQuest rewards consistent practice: complete lessons, hit quest targets,
              and climb the leaderboard with every run.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/quests"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl theme-button shadow-[0_0_20px_var(--theme-glow)]"
              >
                <Sparkles size={16} />
                View Daily Quests
              </Link>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-600 text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                <Crown size={16} />
                Customize Profile
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Level" value={String(level)} accent="accent-text" />
            <StatTile label="Streak" value={`${streak}d`} accent="text-orange-300" />
            <StatTile label="XP" value={String(xp)} accent="text-blue-300" />
            <StatTile
              label="Quests"
              value={`${activeQuestCount}`}
              accent="text-emerald-300"
            />
          </div>
        </div>
      </section>

      <section>
        {langsLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-40 rounded-2xl bg-slate-900/70 animate-pulse" />
            ))}
          </div>
        )}

        {!langsLoading && langs && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {langs.map((lang, index) => (
              <LanguageCard key={lang.id} lang={lang} index={index} />
            ))}
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <DailySnapshot />
        <RecommendedCard />
      </section>
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function DailySnapshot() {
  const { dailyStats, streak } = useUserStore();
  const { data: quests } = useSWR("daily-quests", fetchDailyQuests);
  const { claimedQuestIds } = useUserStore();

  const completedQuestCount = quests
    ? quests.filter((quest) => claimedQuestIds.includes(quest.id)).length
    : 0;

  return (
    <article className="glass-panel rounded-2xl p-5 border-slate-700/70">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-white">Today&apos;s Momentum</h3>
        <Target size={18} className="accent-text" />
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <Metric label="Lessons" value={String(dailyStats.lessonsCompleted)} />
        <Metric label="XP Earned" value={String(dailyStats.xpEarned)} />
        <Metric label="Streak" value={`${streak}d`} />
      </div>
      <p className="text-sm text-slate-300">
        {completedQuestCount > 0
          ? `${completedQuestCount} daily quest reward${completedQuestCount > 1 ? "s" : ""} claimed.`
          : "No rewards claimed yet. Complete a quest to boost your progress."}
      </p>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
      <p className="text-xs text-slate-400 uppercase tracking-[0.14em]">{label}</p>
      <p className="text-xl font-black text-white mt-1">{value}</p>
    </div>
  );
}

function RecommendedCard() {
  const { completedLessons } = useUserStore();
  const preferredLanguage = "python";

  const { data: lesson } = useSWR(
    ["recommended-lesson", preferredLanguage, completedLessons.join("|")],
    () => fetchRecommendedLesson(preferredLanguage, completedLessons),
  );

  const { data: progress } = useSWR(["progress", preferredLanguage], () =>
    fetchLanguageProgress(preferredLanguage),
  );

  if (!lesson) {
    return (
      <article className="glass-panel rounded-2xl p-5 border-slate-700/70">
        <p className="text-slate-300">Loading recommendation...</p>
      </article>
    );
  }

  return (
    <article className="glass-panel rounded-2xl p-5 border-slate-700/70">
      <p className="text-xs uppercase tracking-[0.2em] accent-text mb-2">Recommended Next</p>
      <h3 className="text-xl font-black text-white mb-1">{lesson.title}</h3>
      <p className="text-slate-300 text-sm mb-4">{lesson.description}</p>
      <div className="text-sm text-slate-300 space-y-1 mb-4">
        <p>Reward: +{lesson.xpReward} XP, +{lesson.coinReward} Coins</p>
        <p>Questions: {lesson.questions.length}</p>
        {progress && <p>Path XP available: {progress.totalXp}</p>}
      </div>
      <Link
        href={`/dashboard/learn/${lesson.languageId}?lesson=${lesson.id}`}
        className="inline-flex w-full justify-center rounded-xl theme-button py-3 transition-colors"
      >
        Start Lesson
      </Link>
    </article>
  );
}

function LanguageCard({ lang, index }: { lang: any; index: number }) {
  const { completedLessons } = useUserStore();
  const ui = languageUi[lang.id as keyof typeof languageUi];
  const Icon = ui.icon;
  const prefix = lessonPrefixMap[lang.id as keyof typeof lessonPrefixMap];
  const completedInLanguage = completedLessons.filter((lessonId) =>
    lessonId.startsWith(prefix),
  ).length;

  const { data: progress } = useSWR(["progress", lang.id], () =>
    fetchLanguageProgress(lang.id),
  );

  const totalLessons = progress?.totalLessons || 0;
  const completionRate = totalLessons > 0 ? Math.round((completedInLanguage / totalLessons) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link
        href={`/dashboard/learn/${lang.id}`}
        className={`glass-panel block rounded-2xl p-5 border ${ui.border} ${ui.glow} hover:-translate-y-0.5 transition-transform`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${ui.bg} ${ui.color}`}>
            <Icon size={24} strokeWidth={2.4} />
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {languageIcons[lang.id as keyof typeof languageIcons]}
          </span>
        </div>
        <h3 className="text-xl font-black text-white mb-1">{lang.name}</h3>
        <p className="text-slate-300 text-sm mb-4">{lang.tagline}</p>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full accent-bg transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-400 flex justify-between">
          <span>{completedInLanguage} {completedInLanguage === 1 ? "lesson" : "lessons"} done</span>
          <span>{completionRate}%</span>
        </div>
      </Link>
    </motion.div>
  );
}
