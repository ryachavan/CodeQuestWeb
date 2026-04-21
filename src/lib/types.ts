export type LanguageId = "python" | "c" | "cpp" | "html";

export const languageIds: LanguageId[] = ["python", "c", "cpp", "html"];

export const isLanguageId = (value: string): value is LanguageId =>
  languageIds.includes(value as LanguageId);

export type Difficulty = "beginner" | "intermediate";

export type QuestionType = "multiple_choice" | "code_assembly" | "fill_blank";

export type ThemeId = "neon-cyan" | "solar-flare" | "matrix-green";

export type AvatarId = "pixel-bot" | "fox-coder" | "orb-wizard";

export interface Language {
  id: LanguageId;
  name: string;
  tagline: string;
  description: string;
}

export interface LearningModule {
  id: string;
  languageId: LanguageId;
  title: string;
  order: number;
  requiredXp: number;
  difficulty: Difficulty;
  lessonIds: string[];
}

interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: string[];
  correctIndex: number;
}

export interface CodeAssemblyQuestion extends BaseQuestion {
  type: "code_assembly";
  pieces: string[];
  correctOrder: string[];
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "fill_blank";
  template: string;
  placeholder: string;
  answer: string;
}

export type Question =
  | MultipleChoiceQuestion
  | CodeAssemblyQuestion
  | FillBlankQuestion;

export interface Lesson {
  id: string;
  languageId: LanguageId;
  moduleId: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  questions: Question[];
}

export interface ThemeCatalogItem {
  id: ThemeId;
  name: string;
  accent: string;
  cost: number;
  description: string;
}

export interface AvatarCatalogItem {
  id: AvatarId;
  name: string;
  emoji: string;
  cost: number;
  description: string;
}

export interface DailyQuestTemplate {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardXp: number;
  rewardCoins: number;
  metric: "lessonsCompletedToday" | "xpEarnedToday" | "streak";
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  streak: number;
  avatarId: string;
}
