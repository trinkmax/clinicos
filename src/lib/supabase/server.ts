import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/db/database.types";

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 * Respeta la sesión del usuario vía cookies → RLS aplica con su identidad.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Invocado desde un Server Component (cookies de solo lectura).
            // El refresh de sesión lo hace el proxy (src/proxy.ts); seguro de ignorar.
          }
        },
      },
    },
  );
}
