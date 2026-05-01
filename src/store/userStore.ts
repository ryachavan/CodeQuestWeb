import { AvatarId, ThemeId, isThemeId, isAvatarId } from "@/lib/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DailyStats {
  date: string;
  lessonsCompleted: number;
  xpEarned: number;
}

interface UserState {
  id: string;
  username: string;
  email: string | null;
  isAuthenticated: boolean;
  xp: number;
  coins: number;
  streak: number;
  level: number;
  selectedTheme: ThemeId;
  ownedThemes: ThemeId[];
  selectedAvatar: AvatarId;
  ownedAvatars: AvatarId[];
  completedLessons: string[];
  lessonScores: Record<string, number>;
  claimedQuestIds: string[];
  lastActivity: string | null;
  dailyStats: DailyStats;
  login: (payload: { username: string; email: string | null }) => void;
  updateUsername: (username: string) => void;
  logout: () => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  claimQuest: (questId: string, rewardXp: number, rewardCoins: number) => boolean;
  completeLesson: (payload: {
    lessonId: string;
    score: number;
    xpReward: number;
    coinReward: number;
  }) => void;
  setTheme: (themeId: ThemeId) => void;
  unlockTheme: (themeId: ThemeId, cost: number) => boolean;
  setAvatar: (avatarId: AvatarId) => void;
  unlockAvatar: (avatarId: AvatarId, cost: number) => boolean;
  syncWithSupabase: () => Promise<void>;
  saveToSupabase: () => Promise<void>;
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const getDayDiff = (fromDate: string, toDate: string) => {
  const from = new Date(`${fromDate}T00:00:00.000Z`).getTime();
  const to = new Date(`${toDate}T00:00:00.000Z`).getTime();
  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
};

const calculateLevel = (xp: number) => Math.floor(xp / 250) + 1;

// ---------- Debounce helper for saveToSupabase ----------
let _saveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(saveFn: () => Promise<void>) {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    _saveTimer = null;
    saveFn();
  }, 500);
}

// ---------- Lazy shared Supabase client for store operations ----------
async function getStoreClient() {
  const { getClient } = await import("@/lib/supabaseClient");
  return getClient();
}

const getInitialState = () => ({
  id: "demo-user",
  username: "Guest Coder",
  email: null as string | null,
  isAuthenticated: false,
  xp: 10,
  coins: 0,
  streak: 0,
  level: calculateLevel(10),
  selectedTheme: "neon-cyan" as ThemeId,
  ownedThemes: ["neon-cyan"] as ThemeId[],
  selectedAvatar: "pixel-bot" as AvatarId,
  ownedAvatars: ["pixel-bot"] as AvatarId[],
  completedLessons: [] as string[],
  lessonScores: {} as Record<string, number>,
  claimedQuestIds: [] as string[],
  lastActivity: null as string | null,
  dailyStats: {
    date: formatDate(new Date()),
    lessonsCompleted: 0,
    xpEarned: 0,
  },
});

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      login: ({ username, email }) =>
        set(() => ({
          ...getInitialState(),
          username,
          email: email ?? null,
          isAuthenticated: true,
        })),
      updateUsername: (username: string) => {
        set(() => ({ username }));
        debouncedSave(() => get().saveToSupabase());
      },
      logout: () => set(() => getInitialState()),
      addXp: (amount) => {
        const safeAmount = Math.max(0, amount);
        set((state) => {
          const nextXp = state.xp + safeAmount;
          const today = formatDate(new Date());
          const shouldResetDaily = state.dailyStats.date !== today;
          return {
            xp: nextXp,
            level: calculateLevel(nextXp),
            dailyStats: shouldResetDaily
              ? { date: today, lessonsCompleted: 0, xpEarned: safeAmount }
              : {
                  ...state.dailyStats,
                  xpEarned: state.dailyStats.xpEarned + safeAmount,
                },
          };
        });
        debouncedSave(() => get().saveToSupabase());
      },
      addCoins: (amount) => {
        set((state) => ({
          coins: state.coins + Math.max(0, amount),
        }));
        debouncedSave(() => get().saveToSupabase());
      },
      spendCoins: (amount) => {
        const safeAmount = Math.max(0, amount);
        const canSpend = get().coins >= safeAmount;
        if (!canSpend) {
          return false;
        }
        set((state) => ({ coins: state.coins - safeAmount }));
        debouncedSave(() => get().saveToSupabase());
        return true;
      },
      claimQuest: (questId, rewardXp, rewardCoins) => {
        if (get().claimedQuestIds.includes(questId)) {
          return false;
        }

        set((state) => ({
          claimedQuestIds: [...state.claimedQuestIds, questId],
        }));
        // addXp and addCoins each schedule a debounced save; the debounce
        // collapses them into a single write.
        get().addXp(rewardXp);
        get().addCoins(rewardCoins);
        return true;
      },
      completeLesson: ({ lessonId, score, xpReward, coinReward }) => {
        const today = formatDate(new Date());
        const safeScore = Math.max(0, Math.min(100, score));

        set((current) => {
          const shouldResetDaily = current.dailyStats.date !== today;
          const alreadyCompleted = current.completedLessons.includes(lessonId);

          let nextStreak = current.streak;
          if (!current.lastActivity) {
            nextStreak = 1;
          } else {
            const diff = getDayDiff(current.lastActivity, today);
            if (diff === 1) {
              nextStreak = current.streak + 1;
            }
            if (diff > 1) {
              nextStreak = 1;
            }
          }

          const rewardedXp = alreadyCompleted ? Math.round(xpReward * 0.35) : xpReward;
          const rewardedCoins = alreadyCompleted ? Math.round(coinReward * 0.35) : coinReward;
          const nextXp = current.xp + rewardedXp;

          return {
            xp: nextXp,
            coins: current.coins + rewardedCoins,
            level: calculateLevel(nextXp),
            streak: nextStreak,
            lastActivity: today,
            lessonScores: {
              ...current.lessonScores,
              [lessonId]: Math.max(safeScore, current.lessonScores[lessonId] ?? 0),
            },
            completedLessons: (alreadyCompleted || safeScore < 60)
              ? current.completedLessons
              : [...current.completedLessons, lessonId],
            dailyStats: shouldResetDaily
              ? {
                  date: today,
                  lessonsCompleted: 1,
                  xpEarned: rewardedXp,
                }
              : {
                  ...current.dailyStats,
                  lessonsCompleted: current.dailyStats.lessonsCompleted + 1,
                  xpEarned: current.dailyStats.xpEarned + rewardedXp,
                },
          };
        });
        debouncedSave(() => get().saveToSupabase());

        const state = get();
        if (state.isAuthenticated && state.id !== "demo-user") {
          const passed = safeScore >= 60;
          if (passed) {
            getStoreClient().then((supabase) => {
              supabase.from("user_progress").upsert({ 
                user_id: state.id, 
                lesson_id: lessonId 
              }, { onConflict: 'user_id, lesson_id' }).then(({ error }) => {
                if (error) {
                  console.error("Failed to save lesson progress:", error);
                }
              });
            }).catch(err => console.error("Failed to save user progress:", err));
          }
        }
      },
      setTheme: (themeId) => {
        set((state) => ({
          selectedTheme: state.ownedThemes.includes(themeId) ? themeId : state.selectedTheme,
        }));
        debouncedSave(() => get().saveToSupabase());
      },
      unlockTheme: (themeId, cost) => {
        const state = get();
        if (state.ownedThemes.includes(themeId)) {
          state.setTheme(themeId);
          return true;
        }

        const paid = state.spendCoins(cost);
        if (!paid) {
          return false;
        }

        set((current) => ({
          ownedThemes: [...current.ownedThemes, themeId],
          selectedTheme: themeId,
        }));
        
        // Persist to user_themes
        if (state.isAuthenticated && state.id !== "demo-user") {
          getStoreClient().then((supabase) => {
            supabase.from("user_themes").insert({ user_id: state.id, theme_id: themeId }).then(({ error }) => {
              if (error) {
                console.error("Failed to unlock theme:", error);
              } else {
                debouncedSave(() => get().saveToSupabase());
              }
            });
          }).catch(err => console.error("Failed to save theme unlock:", err));
        }

        return true;
      },
      setAvatar: (avatarId) => {
        set((state) => ({
          selectedAvatar: state.ownedAvatars.includes(avatarId)
            ? avatarId
            : state.selectedAvatar,
        }));
        debouncedSave(() => get().saveToSupabase());
      },
      unlockAvatar: (avatarId, cost) => {
        const state = get();
        if (state.ownedAvatars.includes(avatarId)) {
          state.setAvatar(avatarId);
          return true;
        }

        const paid = state.spendCoins(cost);
        if (!paid) {
          return false;
        }

        set((current) => ({
          ownedAvatars: [...current.ownedAvatars, avatarId],
          selectedAvatar: avatarId,
        }));

        // Persist to user_avatars
        if (state.isAuthenticated && state.id !== "demo-user") {
          getStoreClient().then((supabase) => {
            supabase.from("user_avatars").insert({ user_id: state.id, avatar_id: avatarId }).then(({ error }) => {
              if (error) {
                console.error("Failed to unlock avatar:", error);
              } else {
                debouncedSave(() => get().saveToSupabase());
              }
            });
          }).catch(err => console.error("Failed to save avatar unlock:", err));
        }

        return true;
      },
      syncWithSupabase: async () => {
        try {
          const supabase = await getStoreClient();
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) throw userError;
          if (!user) return;

          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') throw profileError;

          if (profile) {
            const [
              { data: themes, error: themesError },
              { data: avatars, error: avatarsError },
              { data: progress, error: progressError },
            ] = await Promise.all([
              supabase.from("user_themes").select("theme_id").eq("user_id", user.id),
              supabase.from("user_avatars").select("avatar_id").eq("user_id", user.id),
              supabase.from("user_progress").select("lesson_id").eq("user_id", user.id),
            ]);
            
            if (themesError) throw themesError;
            if (avatarsError) throw avatarsError;
            if (progressError) throw progressError;
            
            const validTheme = isThemeId(profile.theme_id) ? profile.theme_id : "neon-cyan";
            const validAvatar = isAvatarId(profile.avatar_id) ? profile.avatar_id : "pixel-bot";
            
            const syncedXp = profile.xp || 0;
            set({
              id: user.id,
              username: profile.username,
              email: user.email || null,
              isAuthenticated: true,
              xp: syncedXp,
              coins: profile.coins || 0,
              streak: profile.streak || 0,
              level: calculateLevel(syncedXp),
              lastActivity: profile.last_activity || null,
              selectedTheme: validTheme,
              selectedAvatar: validAvatar,
              ownedThemes: themes?.map((t: any) => isThemeId(t.theme_id) ? t.theme_id : "neon-cyan").filter((id: ThemeId) => id) || ["neon-cyan"],
              ownedAvatars: avatars?.map((a: any) => isAvatarId(a.avatar_id) ? a.avatar_id : "pixel-bot").filter((id: AvatarId) => id) || ["pixel-bot"],
              completedLessons: progress?.map((p: any) => p.lesson_id) || [],
            });
          }
        } catch (error) {
          console.error("Failed to sync with Supabase:", error);
        }
      },
      saveToSupabase: async () => {
        try {
          const state = get();
          if (!state.isAuthenticated || state.id === "demo-user") return;

          const supabase = await getStoreClient();
          
          const { error } = await supabase.from("user_profiles").update({
            username: state.username,
            xp: state.xp,
            coins: state.coins,
            streak: state.streak,
            last_activity: state.lastActivity,
            theme_id: state.selectedTheme,
            avatar_id: state.selectedAvatar,
          }).eq("id", state.id);
          
          if (error) throw error;
        } catch (error) {
          console.error("Failed to save user profile to Supabase:", error);
        }
      },
    }),
    {
      name: "codequest-user-store",
      partialize: (state) => {
        // Persist everything except action functions
        const { login, updateUsername, logout, addXp, addCoins, spendCoins,
          claimQuest, completeLesson, setTheme, unlockTheme, setAvatar,
          unlockAvatar, syncWithSupabase, saveToSupabase, ...data } = state;
        return data;
      },
    },
  ),
);
