"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { createClient } from "@/lib/supabaseClient";

export default function AuthSync() {
  const syncWithSupabase = useUserStore((state) => state.syncWithSupabase);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    const initSync = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await syncWithSupabase();
        }
      } catch (error) {
        console.error("Failed to sync with Supabase:", error);
      }
    };

    initSync();

    let subscription;
    try {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange(
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
      subscription = data;
    } catch (error) {
      console.error("Failed to set up auth listener:", error);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [syncWithSupabase]);

  return null;
}
