"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/auth/roles";
import { action, type ActionResult } from "@/lib/actions/result";
import {
  createChannelSchema,
  metaConfigSchema,
  channelIdSchema,
} from "@/lib/validation/channels";

const ADMIN = [ROLES.owner, ROLES.admin] as const;

export async function createChannel(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: ADMIN, schema: createChannelSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("channels")
        .insert({
          tenant_id: ctx.tenantId,
          tipo: data.tipo,
          nombre: data.nombre,
          estado: "pendiente",
          config: {},
          session: {},
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/ajustes");
      return { id: row.id };
    },
  );
}

/**
 * Guarda credenciales Meta Cloud. Conserva el `graph_token` previo si el
 * formulario lo deja vacío (no se reescribe un secreto por accidente).
 */
export async function saveMetaConfig(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: ADMIN, schema: metaConfigSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: cur, error: e1 } = await supabase
        .from("channels")
        .select("config")
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId)
        .single();
      if (e1 || !cur) throw new Error("Canal no encontrado.");

      const prev = (cur.config ?? {}) as Record<string, unknown>;
      const token =
        data.graph_token ??
        (typeof prev.graph_token === "string" ? prev.graph_token : "");
      if (!token) throw new Error("Falta el token de la Graph API.");

      const { error } = await supabase
        .from("channels")
        .update({
          estado: "pendiente",
          config: {
            phone_number_id: data.phone_number_id,
            graph_token: token,
            graph_version: data.graph_version,
            waba_id: data.waba_id ?? null,
          },
        })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath("/ajustes");
      return { id: data.id };
    },
  );
}

/**
 * Reinicia la vinculación. Baileys: borra la sesión → el worker genera un QR
 * nuevo. Cloud: vuelve a "pendiente" para que el worker revalide credenciales.
 */
export async function reconnectChannel(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: ADMIN, schema: channelIdSchema, input: { id } },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: ch, error: e1 } = await supabase
        .from("channels")
        .select("tipo, config")
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId)
        .single();
      if (e1 || !ch) throw new Error("Canal no encontrado.");

      if (ch.tipo === "whatsapp_baileys") {
        const { error } = await supabase
          .from("channels")
          .update({ estado: "pendiente", session: {}, config: {} })
          .eq("id", data.id)
          .eq("tenant_id", ctx.tenantId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("channels")
          .update({ estado: "pendiente" })
          .eq("id", data.id)
          .eq("tenant_id", ctx.tenantId);
        if (error) throw new Error(error.message);
      }
      revalidatePath("/ajustes");
      return { id: data.id };
    },
  );
}

export async function deleteChannel(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: ADMIN, schema: channelIdSchema, input: { id } },
    async (data, ctx) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("channels")
        .delete()
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath("/ajustes");
      return { id: data.id };
    },
  );
}
