import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy-session";

/**
 * Next.js 16 — `proxy.ts` (antes `middleware.ts`).
 * Export `proxy` (antes `middleware`) + `config` con el matcher
 * (el nombre del config export sigue siendo `config`, NO `proxyConfig`:
 * Next 16 solo reconoce `export const config`; con otro nombre el
 * matcher se ignora y el proxy corre en TODOS los requests).
 *
 * Refresca la sesión Supabase y protege rutas. Mantener liviano: solo
 * intercepción/auth/redirects (sin lógica de negocio pesada).
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Todas las rutas excepto:
     *  - _next/static, _next/image
     *  - favicon / archivos estáticos de imagen
     * (las API/route handlers SÍ pasan por el proxy para refrescar sesión)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif)$).*)",
  ],
};
