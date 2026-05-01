"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

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
              
              const { getClient } = await import("@/lib/supabaseClient");
              const supabase = getClient();
              await supabase.auth.signOut();
              
              useUserStore.getState().logout();
            } catch (error) {
              console.error("Failed to clear dev state:", error);
            } finally {
              window.location.reload();
            }
          })();
        }
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, [selectedTheme]);

  return null;
}
