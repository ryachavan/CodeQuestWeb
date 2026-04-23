"use client";

import useSWR from "swr";
import { LogOut, Palette, Sparkles, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { fetchAvatarCatalog, fetchThemeCatalog } from "@/lib/dataApi";
import { useUserStore } from "@/store/userStore";

export default function ProfilePage() {
  const {
    username,
    email,
    xp,
    coins,
    streak,
    level,
    selectedTheme,
    selectedAvatar,
    ownedThemes,
    ownedAvatars,
    setTheme,
    unlockTheme,
    setAvatar,
    unlockAvatar,
    logout,
  } = useUserStore();

  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      logout();
      router.push("/");
    }
  };

  const { data: themes } = useSWR("theme-catalog", fetchThemeCatalog);
  const { data: avatars } = useSWR("avatar-catalog", fetchAvatarCatalog);

  return (
    <div className="space-y-6">
      <header className="glass-panel rounded-3xl p-6 border-slate-700/70">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">Profile Hub</p>
        <h1 className="text-3xl font-black text-white">{username}</h1>
        <p className="text-slate-300 mt-2">{email ?? "No email connected"}</p>

        <div className="mt-5 grid sm:grid-cols-4 gap-3">
          <Stat label="Level" value={String(level)} />
          <Stat label="XP" value={String(xp)} />
          <Stat label="Coins" value={String(coins)} />
          <Stat label="Streak" value={`${streak}d`} />
        </div>
      </header>

      <section className="glass-panel rounded-2xl p-5 border-slate-700/70">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={18} className="text-cyan-300" />
          <h2 className="text-xl font-black text-white">Theme Shop</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {themes?.map((theme) => {
            const owned = ownedThemes.includes(theme.id);
            const selected = selectedTheme === theme.id;
            return (
              <article
                key={theme.id}
                className={`rounded-xl border p-4 ${
                  selected
                    ? "border-cyan-400/45 bg-cyan-500/10"
                    : "border-slate-700/70 bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{theme.name}</h3>
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
                <p className="text-sm text-slate-300 mt-2 min-h-10">{theme.description}</p>
                <button
                  type="button"
                  onClick={() => (owned ? setTheme(theme.id) : unlockTheme(theme.id, theme.cost))}
                  className="mt-3 w-full rounded-lg py-2 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors"
                >
                  {selected ? "Selected" : owned ? "Use Theme" : `Unlock (${theme.cost})`}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5 border-slate-700/70">
        <div className="flex items-center gap-2 mb-4">
          <UserCircle2 size={18} className="text-cyan-300" />
          <h2 className="text-xl font-black text-white">Avatar Shop</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {avatars?.map((avatar) => {
            const owned = ownedAvatars.includes(avatar.id);
            const selected = selectedAvatar === avatar.id;
            return (
              <article
                key={avatar.id}
                className={`rounded-xl border p-4 ${
                  selected
                    ? "border-cyan-400/45 bg-cyan-500/10"
                    : "border-slate-700/70 bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{avatar.name}</h3>
                  <span className="text-2xl" aria-hidden>
                    {avatar.emoji}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-2 min-h-10">{avatar.description}</p>
                <button
                  type="button"
                  onClick={() =>
                    owned ? setAvatar(avatar.id) : unlockAvatar(avatar.id, avatar.cost)
                  }
                  className="mt-3 w-full rounded-lg py-2 bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors"
                >
                  {selected ? "Selected" : owned ? "Use Avatar" : `Unlock (${avatar.cost})`}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5 border-slate-700/70 border-b-4 border-b-red-500/20">
        <div className="flex items-center gap-2 mb-2">
          <LogOut size={18} className="text-red-400" />
          <h2 className="text-xl font-black text-white">Danger Zone</h2>
        </div>
        <p className="text-slate-300 text-sm mb-4">
          Exit your current session. Your progress is saved to the cloud.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all w-full justify-center sm:w-auto"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="text-xl font-black text-white mt-1">{value}</p>
    </div>
  );
}
