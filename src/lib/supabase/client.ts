import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/db/database.types";

/**
 * Cliente Supabase para componentes de cliente (browser).
 * Usa la PUBLISHABLE key (segura para el browser). Nunca la secret.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
