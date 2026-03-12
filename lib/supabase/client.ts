import { createClient } from "@supabase/supabase-js";

/**
 * Client-side Supabase client.
 * Uses the anon key which is safe to expose in the browser.
 */
export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Singleton instance for client-side use
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null;

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }
  return browserClient;
}
