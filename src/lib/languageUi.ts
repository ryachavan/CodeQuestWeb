import { Code2, FileCode2, Globe, Terminal } from "lucide-react";
import { LanguageId } from "@/lib/types";

export const languageUi = {
  python: {
    icon: Terminal,
    color: "text-yellow-300",
    bg: "bg-yellow-400/10",
    border: "border-yellow-300/25",
    glow: "shadow-[0_0_22px_rgba(250,204,21,0.16)]",
  },
  c: {
    icon: Code2,
    color: "text-sky-300",
    bg: "bg-sky-400/10",
    border: "border-sky-300/25",
    glow: "shadow-[0_0_22px_rgba(56,189,248,0.16)]",
  },
  cpp: {
    icon: FileCode2,
    color: "text-indigo-300",
    bg: "bg-indigo-400/10",
    border: "border-indigo-300/25",
    glow: "shadow-[0_0_22px_rgba(129,140,248,0.16)]",
  },
  html: {
    icon: Globe,
    color: "text-orange-300",
    bg: "bg-orange-400/10",
    border: "border-orange-300/25",
    glow: "shadow-[0_0_22px_rgba(251,146,60,0.16)]",
  },
} as const;

export const languageOrder: LanguageId[] = ["python", "c", "cpp", "html"];
