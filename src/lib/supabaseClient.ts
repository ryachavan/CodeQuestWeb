import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createClient() {
  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  );
}

// Shared singleton – avoids auth lock race conditions when multiple callers
// fire in parallel. Lazily initialised on first call.
let _sharedClient: ReturnType<typeof createClient> | null = null;
export function getClient() {
  if (!_sharedClient) _sharedClient = createClient();
  return _sharedClient;
}

export const hasSupabaseConfig = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url'
);
