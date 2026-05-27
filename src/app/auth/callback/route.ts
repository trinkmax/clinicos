import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Handler de retorno para flujos de Supabase Auth Recovery / OTP.
 * El email de recuperación apunta acá con `?code=...&next=/reset-password`.
 * Acá intercambiamos el código por una sesión válida y redirigimos a `next`.
 *
 * Si el code es inválido (link expirado / ya usado), redirigimos al login
 * con un parámetro `error` para que el form muestre el mensaje correcto.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=auth_callback_missing_code", url.origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=auth_callback_expired&detail=${encodeURIComponent(
          error.message,
        )}`,
        url.origin,
      ),
    );
  }

  // Solo permitir redirecciones internas para evitar open-redirect.
  const safeNext = next.startsWith("/") ? next : "/";
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
