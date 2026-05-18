"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/auth/roles";
import { action, type ActionResult } from "@/lib/actions/result";
import {
  contactSchema,
  updateStageSchema,
  sendMessageSchema,
  templateSchema,
} from "@/lib/validation/crm";

const CRM = [
  ROLES.owner,
  ROLES.admin,
  ROLES.marketing,
  ROLES.comercial,
  ROLES.recepcion,
] as const;

export async function createContact(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: CRM, schema: contactSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("contacts")
        .insert({ ...data, tenant_id: ctx.tenantId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/inbox");
      return { id: row.id };
    },
  );
}

export async function updateContactStage(
  id: string,
  etapa: string,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: CRM, schema: updateStageSchema, input: { id, etapa } },
    async (data, ctx) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("contacts")
        .update({ etapa: data.etapa })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath("/inbox");
      return { id: data.id };
    },
  );
}

/**
 * Mensaje saliente: se inserta con estado 'pendiente'. El worker Baileys
 * (servicio aparte) lo toma, lo envía por WhatsApp y actualiza estado +
 * provider_msg_id. Abstracción de canal lista para Meta Cloud API.
 */
export async function sendMessage(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: CRM, schema: sendMessageSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: conv, error: e1 } = await supabase
        .from("conversations")
        .select("id, contact_id")
        .eq("id", data.conversation_id)
        .single();
      if (e1 || !conv) throw new Error("Conversación no encontrada.");

      const { data: msg, error } = await supabase
        .from("messages")
        .insert({
          tenant_id: ctx.tenantId,
          conversation_id: conv.id,
          contact_id: conv.contact_id,
          direccion: "out",
          tipo: "text",
          contenido: data.contenido,
          estado: "pendiente",
          sent_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conv.id);
      revalidatePath("/inbox");
      return { id: msg.id };
    },
  );
}

export async function createTemplate(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: [ROLES.owner, ROLES.admin, ROLES.marketing],
      schema: templateSchema,
      input,
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("message_templates")
        .insert({ ...data, tenant_id: ctx.tenantId, created_by: ctx.userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/inbox");
      return { id: row.id };
    },
  );
}
