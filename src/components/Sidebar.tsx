"use client";

import Link from "next/link";
import { BookOpen, Trophy, User, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function Sidebar() {
  const pathname = usePathname();
  const level = useUserStore((state) => state.level);

  const links = [
    { name: "Learn", href: "/dashboard", icon: BookOpen },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "Quests", href: "/dashboard/quests", icon: Zap },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-700/70 h-screen fixed top-0 left-0 p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded bg-cyan-500/80 text-slate-900 flex items-center justify-center font-black">
          C
        </div>
        <h1 className="text-xl font-black text-white tracking-wide">CodeQuest</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isDashboardRoot = link.href === "/dashboard";
          const isActive = isDashboardRoot
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard/learn")
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                isActive
                  ? "bg-cyan-500/12 text-cyan-300 border border-cyan-400/35 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon size={22} className={isActive ? "text-cyan-300" : ""} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">Current Rank</p>
        <p className="text-xl font-black text-white">Level {level}</p>
        <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full w-2/3 bg-cyan-400 rounded-full" />
        </div>
      </div>
    </aside>
  );
}
