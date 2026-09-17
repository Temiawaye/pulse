import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

export function createAdminClient() {
  const { url } = getSupabaseConfig();
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("A Supabase secret key is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
