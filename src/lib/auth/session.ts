import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isRole, type Role } from "@/lib/auth/roles";

/**
 * Identidad autenticada resuelta desde el JWT (claims verificados).
 * `tenantId` y `role` provienen de `app_metadata` (no manipulable por el usuario).
 */
export interface AuthContext {
  userId: string;
  email: string | null;
  tenantId: string | null;
  role: Role | null;
}

interface AppMetadata {
  tenant_id?: unknown;
  role?: unknown;
  app?: unknown;
}

/**
 * Lee la sesión vía `getClaims()` (práctica recomendada Supabase 2026:
 * verificación local del JWT, sin viaje extra al servidor de Auth).
 * Nunca usar `getSession()` en server: no revalida.
 */
export async function getAuth(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) return null;

  const claims = data.claims as Record<string, unknown>;
  const sub = typeof claims.sub === "string" ? claims.sub : null;
  if (!sub) return null;

  const appMeta = (claims.app_metadata ?? {}) as AppMetadata;
  const roleValue = appMeta.role;

  return {
    userId: sub,
    email: typeof claims.email === "string" ? claims.email : null,
    tenantId:
      typeof appMeta.tenant_id === "string" ? appMeta.tenant_id : null,
    role: isRole(roleValue) ? roleValue : null,
  };
}

/** Exige sesión. Redirige a /login si no hay. Devuelve el contexto si sí. */
export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuth();
  if (!auth) redirect("/login");
  return auth;
}

/**
 * Exige sesión + pertenencia a un tenant activo. Sin tenant asignado aún →
 * pantalla de espera de activación.
 */
export async function requireTenant(): Promise<
  AuthContext & { tenantId: string; role: Role }
> {
  const auth = await requireAuth();
  if (!auth.tenantId || !auth.role) redirect("/sin-acceso");
  return { ...auth, tenantId: auth.tenantId, role: auth.role };
}

/** Exige que el rol esté dentro de `allowed`. Si no, deriva a /sin-acceso. */
export async function requireRole(
  allowed: readonly Role[],
): Promise<AuthContext & { tenantId: string; role: Role }> {
  const ctx = await requireTenant();
  if (!allowed.includes(ctx.role)) redirect("/sin-acceso");
  return ctx;
}
