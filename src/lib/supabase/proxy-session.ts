import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rutas accesibles sin sesión (incluye webhooks entrantes). */
const PUBLIC_PREFIXES = ["/login", "/auth", "/api/webhooks"];
/** Rutas públicas tokenizadas del paciente (futuro: links sin login). */
const PUBLIC_TOKEN_PREFIX = "/p/";

function isPublicPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname.startsWith(PUBLIC_TOKEN_PREFIX)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Refresca la sesión (cookies) en cada request y aplica el gate de autenticación.
 * Llama a `getClaims()` — obligatorio para mantener el token vigente y validado.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // No introducir lógica entre createServerClient y getClaims().
  const { data } = await supabase.auth.getClaims();

  const { pathname } = request.nextUrl;
  const authed = Boolean(data?.claims);
  const publicPath = isPublicPath(pathname);

  if (!authed && !publicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (authed && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
