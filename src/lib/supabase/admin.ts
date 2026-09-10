import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Cliente com service_role: ignora RLS. Só pode ser importado em código que
 * roda exclusivamente no servidor (Route Handlers, cron jobs) — nunca em
 * Client Components nem em código compartilhado com o browser.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
