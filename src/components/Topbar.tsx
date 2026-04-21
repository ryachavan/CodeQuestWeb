"use client";

import { useUserStore } from "@/store/userStore";
import { Zap, Coins, Flame, ShieldCheck } from "lucide-react";

export default function Topbar() {
  const { xp, coins, streak, level } = useUserStore();

  return (
    <div className="h-16 border-b border-slate-800/70 bg-slate-900/70 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      <div className="md:hidden font-black text-xl tracking-wide flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-cyan-500 text-slate-950 flex items-center justify-center text-sm">
          C
        </div>
        CodeQuest
      </div>
      <div className="hidden md:flex items-center gap-2 text-slate-300 text-sm font-semibold">
        <ShieldCheck size={16} className="text-cyan-300" />
        Daily target active
      </div>

      <div className="flex items-center gap-6 font-bold text-sm">
        <div className="hidden sm:flex items-center gap-2 text-cyan-300">
          <span className="text-slate-400">Lv.</span>
          <span>{level}</span>
        </div>
        <div className="flex items-center gap-2 text-orange-400">
          <Flame fill="currentColor" size={20} />
          <span>{streak}</span>
        </div>
        <div className="flex items-center gap-2 text-yellow-400">
          <Coins fill="currentColor" size={20} />
          <span>{coins}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-400">
          <Zap fill="currentColor" size={20} />
          <span>{xp} XP</span>
        </div>
      </div>
    </div>
  );
}
