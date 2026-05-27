"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuth, requireTenant } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/actions/result";

const nameSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80"),
});

export async function updateProfile(
  formData: FormData,
): Promise<ActionResult<{ full_name: string }>> {
  let ctx;
  try {
    ctx = await requireTenant();
  } catch {
    return fail("Sesión no válida.");
  }

  const parsed = nameSchema.safeParse({
    full_name: formData.get("full_name"),
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("memberships")
    .update({ full_name: parsed.data.full_name })
    .eq("user_id", ctx.userId)
    .eq("tenant_id", ctx.tenantId);

  if (error) return fail(error.message);

  revalidatePath("/perfil");
  revalidatePath("/", "layout");
  return ok({ full_name: parsed.data.full_name });
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Ingresá tu contraseña actual"),
    next: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(72, "Máximo 72 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });

export async function changePassword(
  formData: FormData,
): Promise<ActionResult<null>> {
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    return fail("Sesión no válida.");
  }

  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".") || "_"] ??= issue.message;
    }
    return {
      ok: false,
      error: "Revisá los datos del formulario.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  // Verificación de la contraseña actual: reintentamos signIn con el email
  // y la contraseña ingresada. Si pasa, sabemos que es la correcta.
  if (!auth.email) {
    return fail("Tu cuenta no tiene email asociado.");
  }
  const { error: signErr } = await supabase.auth.signInWithPassword({
    email: auth.email,
    password: parsed.data.current,
  });
  if (signErr) {
    return {
      ok: false,
      error: "Contraseña actual incorrecta.",
      fieldErrors: { current: "Contraseña incorrecta" },
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.next,
  });
  if (error) return fail("No se pudo actualizar la contraseña.");

  return ok(null);
}
