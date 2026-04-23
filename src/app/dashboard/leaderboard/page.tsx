"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Crown, Medal, Trophy } from "lucide-react";
import { fetchLeaderboard } from "@/lib/dataApi";
import { useUserStore } from "@/store/userStore";

export default function LeaderboardPage() {
  const { data, isLoading } = useSWR("leaderboard", fetchLeaderboard);
  const userId = useUserStore((state) => state.id);
  const username = useUserStore((state) => state.username);
  const xp = useUserStore((state) => state.xp);
  const streak = useUserStore((state) => state.streak);

  const merged = useMemo(() => {
    if (!data) return [];
    
    // Filter out current user from remote data to avoid duplicates
    const filtered = data.filter(entry => entry.id !== userId);
    
    // Get current user's avatar with fallback
    const userAvatarId = useUserStore.getState().selectedAvatar || "pixel-bot";
    
    // Ensure we have a display name for current user
    const displayName = username && username.trim() ? username : "You";
    
    return [
      ...filtered,
      {
        id: userId || "current-user",
        name: displayName,
        xp: xp || 0,
        streak: streak || 0,
        avatarId: userAvatarId,
      },
    ]
      .sort((a, b) => b.xp - a.xp)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [data, userId, username, xp, streak]);

  return (
    <div className="space-y-6">
      <header className="glass-panel rounded-3xl p-6 border-slate-700/70">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">Global Ranking</p>
        <h1 className="text-3xl font-black text-white">Weekly Leaderboard</h1>
        <p className="text-slate-300 mt-2">
          Push your streak, earn more XP, and climb into the top 3 coders.
        </p>
      </header>

      {isLoading && <div className="h-52 rounded-2xl bg-slate-900/70 animate-pulse" />}

      {!isLoading && (
        <section className="glass-panel rounded-2xl border-slate-700/70 overflow-hidden">
          <div className="grid grid-cols-[72px_1fr_110px_110px] px-4 py-3 text-xs uppercase tracking-[0.14em] text-slate-400 border-b border-slate-700/80">
            <p>Rank</p>
            <p>Coder</p>
            <p className="text-right">XP</p>
            <p className="text-right">Streak</p>
          </div>

          {merged.map((entry) => {
            const isCurrentUser = entry.id === "current-user";
            return (
              <div
                key={entry.id}
                className={`grid grid-cols-[72px_1fr_110px_110px] px-4 py-3 border-b border-slate-800/70 text-sm items-center ${
                  isCurrentUser ? "bg-cyan-500/10" : ""
                }`}
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <RankIcon rank={entry.rank} />
                  <span className="font-bold">#{entry.rank}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg bg-slate-800/80 w-8 h-8 rounded-full flex items-center justify-center border border-slate-700/50">
                    {(() => {
                      const emojiMap: Record<string, string> = {
                        "pixel-bot": "🤖",
                        "fox-coder": "🦊",
                        "orb-wizard": "🔮"
                      };
                      return emojiMap[entry.avatarId] || "🤖";
                    })()}
                  </span>
                  <p className={`font-bold ${isCurrentUser ? "text-cyan-200" : "text-white"}`}>
                    {entry.name || "Unknown User"}
                  </p>
                </div>
                <p className="text-right font-semibold text-slate-100">{entry.xp}</p>
                <p className="text-right font-semibold text-orange-300">{entry.streak}d</p>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Crown size={18} className="text-amber-300" />;
  }
  if (rank === 2) {
    return <Medal size={18} className="text-slate-200" />;
  }
  if (rank === 3) {
    return <Trophy size={18} className="text-orange-300" />;
  }

  return <span className="w-[18px] h-[18px]" />;
}
