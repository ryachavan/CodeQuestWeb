"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { getClient } from "@/lib/supabaseClient";

export default function AuthSync() {
  const syncWithSupabase = useUserStore((state) => state.syncWithSupabase);

  useEffect(() => {
    // Reuse a single client for both the initial check and the listener
    const supabase = getClient();

    const initSync = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await syncWithSupabase();
        }
      } catch (error) {
        console.error("Failed to sync with Supabase:", error);
      }
    };

    initSync();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          try {
            await syncWithSupabase();
          } catch (error) {
            console.error("Failed to sync on auth state change:", error);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncWithSupabase]);

  return null;
}
