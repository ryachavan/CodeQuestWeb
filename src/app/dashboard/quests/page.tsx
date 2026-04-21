"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { CheckCircle2, Gift, Target } from "lucide-react";
import { fetchDailyQuests } from "@/lib/dataApi";
import { useUserStore } from "@/store/userStore";

export default function QuestsPage() {
  const { data: quests, isLoading } = useSWR("daily-quests", fetchDailyQuests);
  const { dailyStats, streak, claimedQuestIds, claimQuest } = useUserStore();

  const progressMap = useMemo(
    () => ({
      lessonsCompletedToday: dailyStats.lessonsCompleted,
      xpEarnedToday: dailyStats.xpEarned,
      streak,
    }),
    [dailyStats.lessonsCompleted, dailyStats.xpEarned, streak],
  );

  return (
    <div className="space-y-6">
      <header className="glass-panel rounded-3xl p-6 border-slate-700/70">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">Daily Missions</p>
        <h1 className="text-3xl font-black text-white">Quests</h1>
        <p className="text-slate-300 mt-2">
          Finish daily objectives for bonus XP and coin drops.
        </p>
      </header>

      {isLoading && <div className="h-44 rounded-2xl bg-slate-900/70 animate-pulse" />}

      {!isLoading && quests && (
        <div className="grid md:grid-cols-2 gap-4">
          {quests.map((quest) => {
            const progress = progressMap[quest.metric];
            const complete = progress >= quest.target;
            const claimed = claimedQuestIds.includes(quest.id);

            return (
              <article
                key={quest.id}
                className={`glass-panel rounded-2xl p-5 border ${
                  claimed
                    ? "border-emerald-400/40 bg-emerald-500/10"
                    : complete
                      ? "border-cyan-400/40"
                      : "border-slate-700/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-white">{quest.title}</h2>
                    <p className="text-sm text-slate-300 mt-1">{quest.description}</p>
                  </div>
                  {claimed ? (
                    <CheckCircle2 className="text-emerald-300" />
                  ) : (
                    <Target className="text-cyan-300" />
                  )}
                </div>

                <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, (progress / quest.target) * 100)}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                  <p>
                    Progress: {progress}/{quest.target}
                  </p>
                  <p>
                    +{quest.rewardXp} XP | +{quest.rewardCoins} Coins
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => claimQuest(quest.id, quest.rewardXp, quest.rewardCoins)}
                  disabled={!complete || claimed}
                  className="mt-4 w-full rounded-xl py-2.5 font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-50 bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:bg-slate-700 disabled:text-slate-400 inline-flex items-center justify-center gap-2"
                >
                  <Gift size={16} />
                  {claimed ? "Claimed" : complete ? "Claim reward" : "Complete objective"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
