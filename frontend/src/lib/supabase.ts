import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseConfig { url: string; anonKey: string; }

function configured(value: string | undefined): value is string {
  return Boolean(value?.trim() && !/^<.*>$/.test(value.trim()));
}

export function getSupabaseConfig(env: Record<string, string | undefined> = import.meta.env): SupabaseConfig | null {
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!configured(url) || !configured(anonKey)) return null;
  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
