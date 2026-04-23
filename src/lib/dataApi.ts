import { Language, LanguageId, LeaderboardEntry, Lesson, LearningModule, ThemeCatalogItem, AvatarCatalogItem, DailyQuestTemplate } from "@/lib/types";
import { createClient } from "@/lib/supabaseClient";

export async function fetchLanguages(): Promise<Language[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("languages").select("*");
    if (error) throw error;
    return (data || []) as Language[];
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    return [];
  }
}

export async function fetchModulesByLanguage(languageId: LanguageId): Promise<LearningModule[]> {
  try {
    const supabase = await createClient();
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select('id, languageId:language_id, title, order, requiredXp:required_xp, difficulty')
      .eq("language_id", languageId)
      .order("order", { ascending: true });

    if (modulesError) throw modulesError;
    if (!modules) return [];

    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select('id, module_id')
      .eq("language_id", languageId);

    if (lessonsError) throw lessonsError;

    return modules.map(m => ({
      ...m,
      lessonIds: (lessons || []).filter(l => l.module_id === m.id).map(l => l.id)
    })) as LearningModule[];
  } catch (error) {
    console.error("Failed to fetch modules for language:", error);
    return [];
  }
}

export async function fetchAllModules(): Promise<LearningModule[]> {
  try {
    const supabase = await createClient();
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select('id, languageId:language_id, title, order, requiredXp:required_xp, difficulty')
      .order("order", { ascending: true });

    if (modulesError) throw modulesError;
    if (!modules) return [];

    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select('id, module_id');

    if (lessonsError) throw lessonsError;

    return modules.map(m => ({
      ...m,
      lessonIds: (lessons || []).filter(l => l.module_id === m.id).map(l => l.id)
    })) as LearningModule[];
  } catch (error) {
    console.error("Failed to fetch all modules:", error);
    return [];
  }
}

export async function fetchLessonsByLanguage(languageId: LanguageId): Promise<Lesson[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select(`
        id,
        languageId:language_id,
        moduleId:module_id,
        title,
        description,
        xpReward:xp_reward,
        coinReward:coin_reward,
        questions (
          id,
          type,
          prompt,
          data
        )
      `)
      .eq("language_id", languageId);
    
    if (error) throw error;
    return (data || []).map((lesson: any) => ({
      id: lesson.id,
      languageId: lesson.languageId,
      moduleId: lesson.moduleId,
      title: lesson.title,
      description: lesson.description,
      xpReward: lesson.xpReward,
      coinReward: lesson.coinReward,
      questions: (lesson.questions || []).map((q: any) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        ...q.data
      }))
    })) as Lesson[];
  } catch (error) {
    console.error("Failed to fetch lessons for language:", error);
    return [];
  }
}

export async function fetchLessonById(lessonId: string): Promise<Lesson | null> {
  try {
    const supabase = await createClient();
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select('id, languageId:language_id, moduleId:module_id, title, description, xpReward:xp_reward, coinReward:coin_reward')
      .eq("id", lessonId)
      .single();

    if (lessonError) throw lessonError;
    if (!lesson) return null;

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select('*')
      .eq("lesson_id", lessonId);

    if (questionsError) throw questionsError;

    const formattedQuestions = (questions || []).map((q: any) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      ...q.data
    }));

    return {
      ...lesson,
      questions: formattedQuestions
    } as Lesson;
  } catch (error) {
    console.error("Failed to fetch lesson by ID:", error);
    return null;
  }
}

export async function fetchLanguageProgress(languageId: LanguageId) {
  try {
    const supabase = await createClient();
    const [{ count: modulesCount, error: modulesError }, { data: lessonsData, error: lessonsError }] = await Promise.all([
      supabase.from("modules").select('*', { count: 'exact', head: true }).eq("language_id", languageId),
      supabase.from("lessons").select('xp_reward').eq("language_id", languageId)
    ]);

    if (modulesError) throw modulesError;
    if (lessonsError) throw lessonsError;

    const totalXp = (lessonsData || []).reduce((acc, l) => acc + l.xp_reward, 0);

    return {
      totalModules: modulesCount || 0,
      totalLessons: lessonsData?.length || 0,
      totalXp,
    };
  } catch (error) {
    console.error("Failed to fetch language progress:", error);
    return {
      totalModules: 0,
      totalLessons: 0,
      totalXp: 0,
    };
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, name:username, xp, streak, avatar_id")
      .order("xp", { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return (data || []).map((user: any) => ({
      id: user.id,
      name: user.name,
      xp: user.xp,
      streak: user.streak,
      avatarId: user.avatar_id || "pixel-bot",
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

export async function fetchThemeCatalog(): Promise<ThemeCatalogItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("themes").select("*");
    if (error) throw error;
    return (data || []) as ThemeCatalogItem[];
  } catch (error) {
    console.error("Failed to fetch theme catalog:", error);
    return [];
  }
}

export async function fetchAvatarCatalog(): Promise<AvatarCatalogItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("avatars").select("*");
    if (error) throw error;
    return (data || []) as AvatarCatalogItem[];
  } catch (error) {
    console.error("Failed to fetch avatar catalog:", error);
    return [];
  }
}

export async function fetchDailyQuests(): Promise<DailyQuestTemplate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("daily_quests").select("*");
    
    if (error) throw error;
    return (data || []).map(q => ({
      ...q,
      rewardXp: q.reward_xp,
      rewardCoins: q.reward_coins
    })) as DailyQuestTemplate[];
  } catch (error) {
    console.error("Failed to fetch daily quests:", error);
    return [];
  }
}

export async function fetchRecommendedLesson(
  languageId: LanguageId,
  completedLessonIds: string[],
): Promise<Lesson | null> {
  const scopedModules = await fetchModulesByLanguage(languageId);

  for (const learningModule of scopedModules) {
    const nextId = learningModule.lessonIds.find((id) => !completedLessonIds.includes(id));
    if (nextId) {
      return fetchLessonById(nextId);
    }
  }

  if (scopedModules.length > 0 && scopedModules[0].lessonIds.length > 0) {
     return fetchLessonById(scopedModules[0].lessonIds[0]);
  }
  return null;
}
