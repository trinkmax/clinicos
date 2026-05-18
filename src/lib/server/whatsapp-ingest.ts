import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface CloudInbound {
  phoneNumberId: string;
  fromPhone: string;
  fromName?: string;
  text: string;
  providerMsgId?: string;
  at: string;
}

/**
 * Ingesta de un mensaje entrante de WhatsApp Cloud API (Meta) recibido por
 * webhook. Resuelve el tenant por el phone_number_id guardado en el canal.
 * Usa admin client (sin sesión) pero SIEMPRE acota por tenant_id del canal.
 */
export async function ingestCloudInbound(
  msg: CloudInbound,
): Promise<{ ok: boolean; reason?: string }> {
  const db = createAdminClient();

  const { data: channel } = await db
    .from("channels")
    .select("id, tenant_id")
    .eq("tipo", "whatsapp_cloud")
    .filter("config->>phone_number_id", "eq", msg.phoneNumberId)
    .maybeSingle();
  if (!channel) return { ok: false, reason: "canal no encontrado" };

  const tenantId = channel.tenant_id;

  let contactId: string;
  const { data: existing } = await db
    .from("contacts")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("telefono", msg.fromPhone)
    .maybeSingle();
  if (existing) {
    contactId = existing.id;
    await db
      .from("contacts")
      .update({ last_message_at: msg.at })
      .eq("id", contactId);
  } else {
    const { data: c } = await db
      .from("contacts")
      .insert({
        tenant_id: tenantId,
        telefono: msg.fromPhone,
        nombre: msg.fromName ?? null,
        fuente: "whatsapp",
        etapa: "lead",
        last_message_at: msg.at,
      })
      .select("id")
      .single();
    if (!c) return { ok: false, reason: "no se pudo crear contacto" };
    contactId = c.id;
  }

  let convId: string;
  const { data: conv } = await db
    .from("conversations")
    .select("id, unread")
    .eq("tenant_id", tenantId)
    .eq("contact_id", contactId)
    .eq("estado", "abierta")
    .maybeSingle();
  if (conv) {
    convId = conv.id;
    await db
      .from("conversations")
      .update({ unread: (conv.unread ?? 0) + 1, last_message_at: msg.at })
      .eq("id", convId);
  } else {
    const { data: c2 } = await db
      .from("conversations")
      .insert({
        tenant_id: tenantId,
        contact_id: contactId,
        channel_id: channel.id,
        estado: "abierta",
        unread: 1,
        last_message_at: msg.at,
      })
      .select("id")
      .single();
    if (!c2) return { ok: false, reason: "no se pudo crear conversación" };
    convId = c2.id;
  }

  await db.from("messages").insert({
    tenant_id: tenantId,
    conversation_id: convId,
    contact_id: contactId,
    direccion: "in",
    tipo: "text",
    contenido: msg.text,
    provider_msg_id: msg.providerMsgId ?? null,
    estado: "entregado",
    created_at: msg.at,
  });
  return { ok: true };
}

export interface LeadInput {
  tenantSlug: string;
  source: "facebook" | "google" | "otro";
  nombre?: string;
  telefono?: string;
  email?: string;
  utm?: Record<string, string>;
}

/** Crea un lead (contacto + atribución) desde Facebook/Google Ads. */
export async function createLead(
  lead: LeadInput,
): Promise<{ ok: boolean; reason?: string }> {
  const db = createAdminClient();
  const { data: tenant } = await db
    .from("tenants")
    .select("id")
    .eq("slug", lead.tenantSlug)
    .maybeSingle();
  if (!tenant) return { ok: false, reason: "tenant no encontrado" };

  const { data: contact } = await db
    .from("contacts")
    .insert({
      tenant_id: tenant.id,
      nombre: lead.nombre ?? null,
      telefono: lead.telefono ?? null,
      email: lead.email ?? null,
      fuente: lead.source === "otro" ? "otro" : lead.source,
      etapa: "lead",
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  await db.from("attribution").insert({
    tenant_id: tenant.id,
    contact_id: contact?.id ?? null,
    fuente: lead.source === "otro" ? "otro" : lead.source,
    utm: (lead.utm ?? {}) as never,
    costo: 0,
    ingreso: 0,
  });
  return { ok: true };
}
