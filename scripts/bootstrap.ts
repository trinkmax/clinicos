/**
 * Bootstrap idempotente de clinicOS: crea/reutiliza la clínica (tenant),
 * crea o VINCULA el usuario dueño (merge de app_metadata { tenant_id,
 * role:'owner', app:'clinicos' }) y su membership.
 *
 *   pnpm tsx scripts/bootstrap.ts "<Nombre clínica>" <slug> <email> [--reset-password]
 *
 * Requiere SUPABASE_SECRET_KEY. NO toca user_metadata (el trigger legado
 * `workos` se guarda por user_metadata.app === 'workos'). auth.users es
 * COMPARTIDA: si el email ya existe (p.ej. dueño de workos), se vincula
 * sin pisar su app_metadata previa ni su contraseña (salvo --reset-password,
 * que afecta también el login de workos por ser el mismo usuario).
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* las env pueden venir del entorno */
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const resetPassword = process.argv.includes("--reset-password");
const [name, slug, email] = args;

if (!name || !slug || !email) {
  console.error(
    'Uso: pnpm tsx scripts/bootstrap.ts "<Nombre>" <slug> <email> [--reset-password]',
  );
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error("El slug debe ser minúsculas, números y guiones.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local.",
  );
  process.exit(1);
}

const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target: string) {
  const lower = target.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(`listUsers: ${error.message}`);
    const hit = data.users.find((u) => u.email?.toLowerCase() === lower);
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  // 1) Tenant (reutilizar si el slug ya existe)
  let tenantId: string;
  const { data: existingTenant } = await admin
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingTenant) {
    tenantId = existingTenant.id as string;
    console.log(`• Tenant existente reutilizado (${slug}).`);
  } else {
    const { data: t, error } = await admin
      .from("tenants")
      .insert({ name, slug })
      .select("id")
      .single();
    if (error || !t) throw new Error(`Tenant: ${error?.message}`);
    tenantId = t.id as string;
    console.log(`• Tenant creado (${slug}).`);
  }

  // 2) Usuario: crear o vincular el existente
  const existingUser = await findUserByEmail(email);
  let userId: string;
  let passwordMsg: string;

  if (existingUser) {
    userId = existingUser.id;
    const mergedAppMeta = {
      ...(existingUser.app_metadata ?? {}),
      tenant_id: tenantId,
      role: "owner",
      app: "clinicos",
    };
    const newPassword = resetPassword
      ? randomBytes(12).toString("base64url")
      : undefined;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: mergedAppMeta,
      ...(newPassword ? { password: newPassword } : {}),
    });
    if (error) throw new Error(`Vincular usuario: ${error.message}`);
    console.log("• Usuario existente vinculado a clinicOS (app_metadata).");
    passwordMsg = newPassword
      ? `Password (NUEVA, también cambia el login de workos): ${newPassword}`
      : "Password: usá la que ya tenías (mismo usuario que workos). Si no la sabés, re-corré con --reset-password o reseteala en el Dashboard → Auth.";
  } else {
    const password = randomBytes(12).toString("base64url");
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { tenant_id: tenantId, role: "owner", app: "clinicos" },
    });
    if (error || !created.user) throw new Error(`Usuario: ${error?.message}`);
    userId = created.user.id;
    console.log("• Usuario dueño creado.");
    passwordMsg = `Password temporal: ${password}  ← cambiala al primer ingreso`;
  }

  // 3) Membership (upsert idempotente)
  const { data: existingM } = await admin
    .from("memberships")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingM) {
    await admin
      .from("memberships")
      .update({ role: "owner", status: "active" })
      .eq("id", existingM.id);
    console.log("• Membership existente actualizado (owner/active).");
  } else {
    const { error } = await admin.from("memberships").insert({
      tenant_id: tenantId,
      user_id: userId,
      role: "owner",
      status: "active",
      full_name: email.split("@")[0],
    });
    if (error) throw new Error(`Membership: ${error.message}`);
    console.log("• Membership creado (owner).");
  }

  console.log("\n✓ Bootstrap completo\n");
  console.log(`  Clínica:   ${name} (${slug})`);
  console.log(`  Tenant ID: ${tenantId}`);
  console.log(`  Dueño:     ${email}`);
  console.log(`  ${passwordMsg}\n`);
}

main().catch((e) => {
  console.error("\n✗ Bootstrap falló:", e.message, "\n");
  process.exit(1);
});
