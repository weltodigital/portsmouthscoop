import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client using the public anon key — used only to upload
// sponsor creative photos directly to Storage (keeps large files off our API
// routes, which are capped at ~4.5MB on Vercel). Returns null if unconfigured.
let cached: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
