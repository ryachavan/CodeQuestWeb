import { Language, LanguageId, LeaderboardEntry, Lesson, LearningModule, ThemeCatalogItem, AvatarCatalogItem, DailyQuestTemplate } from "@/lib/types";
import { createClient } from "@/lib/supabaseClient";

export async function fetchLanguages(): Promise<Language[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("languages").select("*");
  return (data || []) as Language[];
}

export async function fetchModulesByLanguage(languageId: LanguageId): Promise<LearningModule[]> {
  const supabase = await createClient();
  const { data: modules } = await supabase
    .from("modules")
    .select('id, languageId:language_id, title, order, requiredXp:required_xp, difficulty')
    .eq("language_id", languageId)
    .order("order", { ascending: true });

  if (!modules) return [];

  const { data: lessons } = await supabase
    .from("lessons")
    .select('id, module_id')
    .eq("language_id", languageId);

  return modules.map(m => ({
    ...m,
    lessonIds: (lessons || []).filter(l => l.module_id === m.id).map(l => l.id)
  })) as LearningModule[];
}

export async function fetchAllModules(): Promise<LearningModule[]> {
  const supabase = await createClient();
  const { data: modules } = await supabase
    .from("modules")
    .select('id, languageId:language_id, title, order, requiredXp:required_xp, difficulty')
    .order("order", { ascending: true });

  if (!modules) return [];

  const { data: lessons } = await supabase
    .from("lessons")
    .select('id, module_id');

  return modules.map(m => ({
    ...m,
    lessonIds: (lessons || []).filter(l => l.module_id === m.id).map(l => l.id)
  })) as LearningModule[];
}

export async function fetchLessonsByLanguage(languageId: LanguageId): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data } = await supabase
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
}

export async function fetchLessonById(lessonId: string): Promise<Lesson | null> {
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select('id, languageId:language_id, moduleId:module_id, title, description, xpReward:xp_reward, coinReward:coin_reward')
    .eq("id", lessonId)
    .single();

  if (!lesson) return null;

  const { data: questions } = await supabase
    .from("questions")
    .select('*')
    .eq("lesson_id", lessonId);

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
}

export async function fetchLanguageProgress(languageId: LanguageId) {
  const supabase = await createClient();
  const [{ count: modulesCount }, { data: lessonsData }] = await Promise.all([
    supabase.from("modules").select('*', { count: 'exact', head: true }).eq("language_id", languageId),
    supabase.from("lessons").select('xp_reward').eq("language_id", languageId)
  ]);

  const totalXp = (lessonsData || []).reduce((acc, l) => acc + l.xp_reward, 0);

  return {
    totalModules: modulesCount || 0,
    totalLessons: lessonsData?.length || 0,
    totalXp,
  };
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("id, name:username, xp, streak, avatar_id")
    .order("xp", { ascending: false })
    .limit(100);
    
  return (data || []).map((user: any) => ({
    id: user.id,
    name: user.name,
    xp: user.xp,
    streak: user.streak,
    avatarId: user.avatar_id || "pixel-bot",
  })) as LeaderboardEntry[];
}

export async function fetchThemeCatalog(): Promise<ThemeCatalogItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("themes").select("*");
  return (data || []) as ThemeCatalogItem[];
}

export async function fetchAvatarCatalog(): Promise<AvatarCatalogItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("avatars").select("*");
  return (data || []) as AvatarCatalogItem[];
}

export async function fetchDailyQuests(): Promise<DailyQuestTemplate[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("daily_quests").select("*");
  
  return (data || []).map(q => ({
    ...q,
    rewardXp: q.reward_xp,
    rewardCoins: q.reward_coins
  })) as DailyQuestTemplate[];
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
