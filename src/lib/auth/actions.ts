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
