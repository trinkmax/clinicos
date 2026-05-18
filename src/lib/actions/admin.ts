"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLES, ALL_ROLES } from "@/lib/auth/roles";
import { action, type ActionResult } from "@/lib/actions/result";

const ADMIN = [ROLES.owner, ROLES.admin] as const;
const roleEnum = z.enum(ALL_ROLES as [string, ...string[]]);

type AdminClient = ReturnType<typeof createAdminClient>;

async function findUserByEmail(admin: AdminClient, email: string) {
  const lower = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    const hit = data.users.find((u) => u.email?.toLowerCase() === lower);
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

export async function inviteMember(
  input: unknown,
): Promise<ActionResult<{ tempPassword?: string }>> {
  return action(
    {
      roles: ADMIN,
      schema: z.object({
        email: z.string().trim().toLowerCase().email("Email inválido"),
        role: roleEnum,
        full_name: z.string().trim().max(120).optional(),
      }),
      input,
    },
    async (data, ctx) => {
      const admin = createAdminClient();
      const existing = await findUserByEmail(admin, data.email);
      let userId: string;
      let tempPassword: string | undefined;

      if (existing) {
        userId = existing.id;
        await admin.auth.admin.updateUserById(userId, {
          app_metadata: {
            ...(existing.app_metadata ?? {}),
            tenant_id: ctx.tenantId,
            role: data.role,
            app: "clinicos",
          },
        });
      } else {
        tempPassword = randomBytes(9).toString("base64url");
        const { data: created, error } =
          await admin.auth.admin.createUser({
            email: data.email,
            password: tempPassword,
            email_confirm: true,
            app_metadata: {
              tenant_id: ctx.tenantId,
              role: data.role,
              app: "clinicos",
            },
          });
        if (error || !created.user)
          throw new Error(error?.message ?? "No se pudo crear el usuario.");
        userId = created.user.id;
      }

      const supabase = await createClient();
      const { data: existingM } = await supabase
        .from("memberships")
        .select("id")
        .eq("tenant_id", ctx.tenantId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingM) {
        await supabase
          .from("memberships")
          .update({
            role: data.role,
            status: "active",
            full_name: data.full_name ?? null,
          })
          .eq("id", existingM.id);
      } else {
        const { error } = await supabase.from("memberships").insert({
          tenant_id: ctx.tenantId,
          user_id: userId,
          role: data.role,
          status: "active",
          full_name: data.full_name ?? data.email.split("@")[0],
        });
        if (error) throw new Error(error.message);
      }
      revalidatePath("/ajustes");
      return { tempPassword };
    },
  );
}

export async function updateMemberRole(
  membershipId: string,
  role: string,
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: ADMIN,
      schema: z.object({ id: z.string().uuid(), role: roleEnum }),
      input: { id: membershipId, role },
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: m, error } = await supabase
        .from("memberships")
        .update({ role: data.role })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId)
        .select("user_id")
        .single();
      if (error) throw new Error(error.message);

      // Sincronizar el claim del JWT (app_metadata.role)
      const admin = createAdminClient();
      const { data: u } = await admin.auth.admin.getUserById(m.user_id);
      await admin.auth.admin.updateUserById(m.user_id, {
        app_metadata: {
          ...(u.user?.app_metadata ?? {}),
          tenant_id: ctx.tenantId,
          role: data.role,
          app: "clinicos",
        },
      });
      revalidatePath("/ajustes");
      return { id: data.id };
    },
  );
}

export async function setMemberStatus(
  membershipId: string,
  status: "active" | "disabled",
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: ADMIN,
      schema: z.object({
        id: z.string().uuid(),
        status: z.enum(["active", "disabled"]),
      }),
      input: { id: membershipId, status },
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: m, error } = await supabase
        .from("memberships")
        .update({ status: data.status })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId)
        .select("user_id, role")
        .single();
      if (error) throw new Error(error.message);

      const admin = createAdminClient();
      const { data: u } = await admin.auth.admin.getUserById(m.user_id);
      const base = (u.user?.app_metadata ?? {}) as Record<string, unknown>;
      await admin.auth.admin.updateUserById(m.user_id, {
        app_metadata:
          data.status === "disabled"
            ? { app: "clinicos" } // revoca acceso al refrescar token
            : {
                ...base,
                tenant_id: ctx.tenantId,
                role: m.role,
                app: "clinicos",
              },
      });
      revalidatePath("/ajustes");
      return { id: data.id };
    },
  );
}

export async function updateTenantName(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return action(
    {
      roles: ADMIN,
      schema: z.object({
        name: z.string().trim().min(1, "Nombre requerido").max(160),
      }),
      input,
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("tenants")
        .update({ name: data.name })
        .eq("id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath("/ajustes");
      return { ok: true };
    },
  );
}
