"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
  next: z.string().startsWith("/").optional(),
});

export interface SignInState {
  error?: string;
}

/** Inicio de sesión con email + contraseña (provisión interna por admin). */
export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  redirect(parsed.data.next ?? "/");
}

/** Cierre de sesión. Tolerante: si la sesión local ya es inválida igual redirige. */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Si Supabase no puede revocar (cuenta borrada / sesión expirada),
    // el redirect limpia igual: el proxy permite /login sin sesión.
  }
  redirect("/login");
}

// ── Recuperación de contraseña ────────────────────────────────────────────────

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
});

export interface ForgotPasswordState {
  ok?: boolean;
  error?: string;
}

/**
 * Envía un email de recuperación. Para no leakear si la cuenta existe o no,
 * devolvemos siempre `ok: true` (Supabase ya no devuelve diferencia tampoco
 * en la última versión, pero la convención sigue).
 */
export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email inválido" };
  }

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  const redirectTo = `${appUrl}/auth/callback?next=/reset-password`;

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  });

  return { ok: true };
}

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(72, "Máximo 72 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });

export interface ResetPasswordState {
  error?: string;
}

/**
 * Setea una nueva contraseña en la sesión recuperada (creada por el callback).
 * Si no hay sesión, devuelve error y manda al login.
 */
export async function setNewPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "El enlace expiró o ya fue usado. Pedí uno nuevo desde «Olvidé mi contraseña».",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: "No se pudo actualizar la contraseña. Reintentá." };
  }

  redirect("/");
}
