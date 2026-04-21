"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

const themeAccentMap = {
  "neon-cyan": "#06b6d4",
  "solar-flare": "#f97316",
  "matrix-green": "#22c55e",
} as const;

export default function ThemeSync() {
  const selectedTheme = useUserStore((state) => state.selectedTheme);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--theme-accent",
      themeAccentMap[selectedTheme],
    );
  }, [selectedTheme]);

  return null;
}
