import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createClient() {
  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  );
}

// Global instance for simple usages when not worried about SSR request pollution
// Note: Next.js App Router encourages per-request clients in server contexts.
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url'
  ? createClient() 
  : null;

export const hasSupabaseConfig = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url'
);
