"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import useSWR from "swr";
import { ArrowRight, Check, Lock, RefreshCcw, Unlock, X } from "lucide-react";
import {
  fetchLessonById,
  fetchLessonsByLanguage,
  fetchModulesByLanguage,
} from "@/lib/dataApi";
import {
  CodeAssemblyQuestion,
  FillBlankQuestion,
  isLanguageId,
  LanguageId,
  Lesson,
  MultipleChoiceQuestion,
  Question,
} from "@/lib/types";
import { useUserStore } from "@/store/userStore";

type AnswerState = {
  multi?: number;
  assembly: string[];
  fill?: string;
};

const defaultLanguage: LanguageId = "python";

export default function LessonPage() {
  const params = useParams<{ language: string }>();
  const searchParams = useSearchParams();
  const requestedLessonId = searchParams.get("lesson");
  const xp = useUserStore((state) => state.xp);
  const completedLessons = useUserStore((state) => state.completedLessons);

  const language: LanguageId = isLanguageId(params.language) ? params.language : defaultLanguage;

  const { data: lessons, isLoading: lessonsLoading } = useSWR(
    ["lessons", language],
    ([, languageArg]) => fetchLessonsByLanguage(languageArg),
  );
  const { data: modules } = useSWR(["modules", language], ([, languageArg]) =>
    fetchModulesByLanguage(languageArg),
  );
  const { data: requestedLesson } = useSWR(
    requestedLessonId ? ["lesson", requestedLessonId] : null,
    ([, lessonId]) => fetchLessonById(lessonId),
  );

  const unlockedModuleIds = useMemo(
    () =>
      (modules ?? [])
        .filter((moduleItem) => moduleItem.requiredXp <= xp)
        .map((moduleItem) => moduleItem.id),
    [modules, xp],
  );

  const lesson = useMemo(() => {
    if (!lessons?.length) {
      return null;
    }

    const unlockedLessons = lessons.filter((item) => unlockedModuleIds.includes(item.moduleId));

    if (!unlockedLessons.length) {
      return lessons[0];
    }

    if (
      requestedLesson &&
      requestedLesson.languageId === language &&
      unlockedModuleIds.includes(requestedLesson.moduleId)
    ) {
      return requestedLesson;
    }

    const nextUncompleted = unlockedLessons.find(
      (lessonItem) => !completedLessons.includes(lessonItem.id),
    );

    if (nextUncompleted) {
      return nextUncompleted;
    }

    return unlockedLessons[0];
  }, [completedLessons, language, lessons, requestedLesson, unlockedModuleIds]);

  if (lessonsLoading || !lesson) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <div className="h-44 rounded-2xl bg-slate-900/70 animate-pulse" />
      </div>
    );
  }

  return (
    <LessonRunner
      lesson={lesson}
      modules={modules ?? []}
      unlockedModules={unlockedModuleIds.length}
    />
  );
}

function LessonRunner({
  lesson,
  modules,
  unlockedModules,
}: {
  lesson: Lesson;
  modules: {
    id: string;
    title: string;
    requiredXp: number;
  }[];
  unlockedModules: number;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(0);
  const [answer, setAnswer] = useState<AnswerState>({ assembly: [] });
  const [lessonDone, setLessonDone] = useState(false);

  const completeLesson = useUserStore((state) => state.completeLesson);

  const question = lesson.questions[questionIndex];
  const progressPercent = ((questionIndex + Number(lessonDone)) / lesson.questions.length) * 100;

  const resetAnswer = () => {
    setAnswer({ assembly: [] });
    setSubmitted(false);
    setIsCorrect(false);
  };

  const submitCurrentAnswer = () => {
    if (submitted) {
      return;
    }

    const correct = evaluateAnswer(question, answer);
    setIsCorrect(correct);
    setSubmitted(true);
    playFeedbackTone(correct);

    if (correct) {
      setAnsweredCorrectly((value) => value + 1);
    }
  };

  const continueFlow = () => {
    if (!submitted) {
      return;
    }

    const isLastQuestion = questionIndex === lesson.questions.length - 1;
    if (!isLastQuestion) {
      setQuestionIndex((value) => value + 1);
      resetAnswer();
      return;
    }

    const projectedCorrect = answeredCorrectly + Number(isCorrect);
    const score = Math.round((projectedCorrect / lesson.questions.length) * 100);

    completeLesson({
      lessonId: lesson.id,
      score,
      xpReward: lesson.xpReward,
      coinReward: lesson.coinReward,
    });
    setLessonDone(true);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Interactive Lesson</p>
            <h1 className="text-2xl md:text-3xl font-black text-white">{lesson.title}</h1>
            <p className="text-slate-300 mt-1">{lesson.description}</p>
          </div>
          <div className="text-right text-sm text-slate-300">
            <p>{lesson.questions.length} questions</p>
            <p>
              {unlockedModules}/{modules.length} modules unlocked
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {modules.map((moduleItem) => {
            const isUnlocked = moduleItem.requiredXp <= useUserStore.getState().xp;
            return (
              <span
                key={moduleItem.id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs ${
                  isUnlocked
                    ? "border-cyan-400/35 bg-cyan-500/10 text-cyan-200"
                    : "border-slate-700 bg-slate-900 text-slate-500"
                }`}
              >
                {isUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                {moduleItem.title}
              </span>
            );
          })}
        </div>

        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-cyan-400 rounded-full"
            animate={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </header>

      {!lessonDone && (
        <article className="glass-panel rounded-2xl p-5 border-slate-700/70">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-2">
            {question.type.replace("_", " ")} challenge
          </p>
          <h2 className="text-2xl font-black text-white leading-tight mb-5">{question.prompt}</h2>

          {question.type === "multiple_choice" && (
            <MultipleChoiceView
              question={question}
              answer={answer.multi}
              submitted={submitted}
              onSelect={(index) => setAnswer((current) => ({ ...current, multi: index }))}
            />
          )}

          {question.type === "code_assembly" && (
            <CodeAssemblyView
              question={question}
              answer={answer.assembly}
              submitted={submitted}
              onChange={(assembly) => setAnswer((current) => ({ ...current, assembly }))}
            />
          )}

          {question.type === "fill_blank" && (
            <FillBlankView
              question={question}
              answer={answer.fill ?? ""}
              submitted={submitted}
              onChange={(value) => setAnswer((current) => ({ ...current, fill: value }))}
            />
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
              Exit lesson
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetAnswer}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <RefreshCcw size={14} />
                Reset
              </button>

              {!submitted ? (
                <button
                  type="button"
                  onClick={submitCurrentAnswer}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold hover:bg-cyan-400 transition-colors"
                >
                  Check answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={continueFlow}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-400 transition-colors"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </article>
      )}

      <AnimatePresence>
        {submitted && !lessonDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`rounded-2xl border p-4 flex items-center justify-between ${
              isCorrect
                ? "bg-emerald-500/12 border-emerald-400/40"
                : "bg-rose-500/12 border-rose-400/40"
            }`}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <Check className="text-emerald-300" size={20} />
              ) : (
                <X className="text-rose-300" size={20} />
              )}
              <p className="font-bold text-white">
                {isCorrect ? "Great!" : "Not quite."} {isCorrect ? "You got it." : "Try the next one."}
              </p>
            </div>
            <p className="text-sm text-slate-300">
              {questionIndex + 1}/{lesson.questions.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {lessonDone && (
        <section className="glass-panel rounded-2xl p-6 border-slate-700/70 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 mb-2">Lesson complete</p>
          <h2 className="text-3xl font-black text-white mb-2">Excellent run.</h2>
          <p className="text-slate-300 mb-5">
            You earned +{lesson.xpReward} XP and +{lesson.coinReward} Coins for finishing this lesson.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/dashboard/learn/${lesson.languageId}`}
              className="px-5 py-3 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Replay Lesson
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-extrabold hover:bg-cyan-400 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function MultipleChoiceView({
  question,
  answer,
  submitted,
  onSelect,
}: {
  question: MultipleChoiceQuestion;
  answer?: number;
  submitted: boolean;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const isSelected = answer === index;
        const isCorrect = index === question.correctIndex;

        let classes = "border-slate-700 text-slate-200 hover:bg-slate-800/80";
        if (submitted && isCorrect) {
          classes = "border-emerald-400/50 bg-emerald-500/10 text-emerald-200";
        } else if (submitted && isSelected && !isCorrect) {
          classes = "border-rose-400/50 bg-rose-500/10 text-rose-200";
        } else if (!submitted && isSelected) {
          classes = "border-cyan-400/50 bg-cyan-500/10 text-cyan-100";
        }

        return (
          <button
            key={option}
            type="button"
            disabled={submitted}
            onClick={() => onSelect(index)}
            className={`w-full p-4 rounded-xl border text-left font-semibold transition-colors ${classes}`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function CodeAssemblyView({
  question,
  answer,
  submitted,
  onChange,
}: {
  question: CodeAssemblyQuestion;
  answer: string[];
  submitted: boolean;
  onChange: (value: string[]) => void;
}) {
  const addPiece = (piece: string) => {
    if (submitted) {
      return;
    }
    onChange([...answer, piece]);
  };

  const removePiece = (index: number) => {
    if (submitted) {
      return;
    }
    onChange(answer.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-300 mb-2">Tap tiles to build the final line:</p>
        <div className="flex flex-wrap gap-2">
          {question.pieces.map((piece) => {
            const isUsed = answer.includes(piece);
            return (
              <button
                type="button"
                key={piece}
                disabled={isUsed || submitted}
                onClick={() => addPiece(piece)}
                className={`px-3 py-2 rounded-lg border font-mono text-sm transition-colors ${
                  isUsed
                    ? "border-slate-700 bg-slate-900 text-slate-500"
                    : "border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                }`}
              >
                {piece}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 min-h-16">
        {answer.length === 0 ? (
          <p className="text-slate-500 text-sm">Assembled code appears here.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {answer.map((piece, index) => (
              <button
                type="button"
                key={`${piece}-${index}`}
                disabled={submitted}
                onClick={() => removePiece(index)}
                className="px-2.5 py-1.5 rounded-md bg-cyan-500/12 border border-cyan-400/40 text-cyan-100 font-mono text-sm"
              >
                {piece}
              </button>
            ))}
          </div>
        )}
      </div>

      {answer.length < question.pieces.length && (
        <p className="text-xs text-slate-500">
          Tip: use all tokens exactly once in the correct order.
        </p>
      )}
    </div>
  );
}

function FillBlankView({
  question,
  answer,
  submitted,
  onChange,
}: {
  question: FillBlankQuestion;
  answer: string;
  submitted: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-cyan-100">
        {question.template}
      </div>
      <input
        value={answer}
        onChange={(event) => onChange(event.target.value)}
        placeholder={question.placeholder}
        disabled={submitted}
        className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400/50"
      />
    </div>
  );
}

function evaluateAnswer(question: Question, answer: AnswerState) {
  if (question.type === "multiple_choice") {
    return answer.multi === question.correctIndex;
  }

  if (question.type === "code_assembly") {
    return JSON.stringify(answer.assembly) === JSON.stringify(question.correctOrder);
  }

  return (answer.fill ?? "").trim().toLowerCase() === question.answer.trim().toLowerCase();
}

function playFeedbackTone(correct: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  const contextConstructor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!contextConstructor) {
    return;
  }

  const context = new contextConstructor();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.value = correct ? 720 : 220;
  gainNode.gain.value = 0.0001;

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  const now = context.currentTime;
  gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  oscillator.start(now);
  oscillator.stop(now + 0.2);

  oscillator.onended = () => {
    context.close().catch(() => undefined);
  };
}
