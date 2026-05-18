import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/database.types";

/**
 * Cliente Supabase con la SECRET key (service_role). BYPASEA RLS.
 *
 * Uso EXCLUSIVO server-side y acotado:
 *  - Provisión de usuarios por invitación (admin) y set de `app_metadata`
 *    ({ tenant_id, role, app: 'clinicos' }) — la base de la autorización multitenant.
 *  - Operaciones de sistema (webhooks del worker, jobs, automatizaciones).
 *
 * Nunca importar desde código de cliente. `import "server-only"` lo garantiza en build.
 * La autorización (quién puede invocar esto) se valida SIEMPRE antes de usarlo.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY no configurada. Requerida para el cliente admin (provisión/sistema).",
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}
