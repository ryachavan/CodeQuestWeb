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
    if (process.env.NODE_ENV === "development") {
      const serverStartTime = process.env.NEXT_PUBLIC_DEV_SERVER_START_TIME;
      if (serverStartTime) {
        const lastStartTime = localStorage.getItem("dev_server_start");
        if (lastStartTime !== serverStartTime) {
          (async () => {
            try {
              localStorage.clear();
              sessionStorage.clear();
              localStorage.setItem("dev_server_start", serverStartTime);
              
              const { createClient } = await import("@/lib/supabaseClient");
              const supabase = createClient();
              if (supabase) {
                await supabase.auth.signOut();
              }
              
              useUserStore.getState().logout();
            } catch (error) {
              console.error("Failed to clear dev state:", error);
            } finally {
              window.location.reload();
            }
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--theme-accent",
      themeAccentMap[selectedTheme],
    );
  }, [selectedTheme]);

  return null;
}
