import "server-only";

import { z } from "zod";

import { requireRole } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";
import type { AuthContext } from "@/lib/auth/session";

/** Envoltorio de resultado uniforme para Server Actions. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}
export function fail(
  error: string,
  fieldErrors?: Record<string, string>,
): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/**
 * Ejecuta una mutación protegida: valida rol (RLS es la defensa real, esto
 * es defensa en profundidad + UX), parsea con Zod y normaliza errores.
 */
export async function action<TSchema extends z.ZodTypeAny, TOut>(
  opts: {
    roles: readonly Role[];
    schema: TSchema;
    input: unknown;
  },
  run: (
    data: z.infer<TSchema>,
    ctx: AuthContext & { tenantId: string; role: Role },
  ) => Promise<TOut>,
): Promise<ActionResult<TOut>> {
  let ctx;
  try {
    ctx = await requireRole(opts.roles);
  } catch {
    return fail("No tenés permiso para esta acción.");
  }

  const parsed = opts.schema.safeParse(opts.input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      fieldErrors[key] ??= issue.message;
    }
    return fail("Revisá los datos del formulario.", fieldErrors);
  }

  try {
    return ok(await run(parsed.data, ctx));
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Ocurrió un error inesperado.";
    return fail(msg);
  }
}
