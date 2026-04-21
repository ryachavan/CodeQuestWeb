"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { createClient } from "@/lib/supabaseClient";

export default function AuthSync() {
  const syncWithSupabase = useUserStore((state) => state.syncWithSupabase);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    const initSync = async () => {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await syncWithSupabase();
      }
    };

    initSync();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await syncWithSupabase();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncWithSupabase]);

  return null;
}
