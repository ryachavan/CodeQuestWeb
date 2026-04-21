"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Trophy, User, Zap } from "lucide-react";

const links = [
  { label: "Learn", href: "/dashboard", icon: BookOpen },
  { label: "Quests", href: "/dashboard/quests", icon: Zap },
  { label: "Ranks", href: "/dashboard/leaderboard", icon: Trophy },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-700/80 bg-slate-950/95 backdrop-blur-xl">
      <div className="grid grid-cols-4">
        {links.map((link) => {
          const isDashboardRoot = link.href === "/dashboard";
          const isActive = isDashboardRoot
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard/learn")
            : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-3 text-xs font-semibold transition-colors ${
                isActive ? "text-cyan-300" : "text-slate-400"
              }`}
            >
              <Icon size={18} />
              <span className="mt-1">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
