import { db } from "./supabase.js";
import type { InboundMessage } from "./types.js";

/** Inserta un mensaje entrante: upsert contacto + conversación + mensaje. */
export async function ingestInbound(
  channelId: string,
  tenantId: string,
  msg: InboundMessage,
): Promise<void> {
  // 1) Contacto por teléfono dentro del tenant
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
      .update({ last_message_at: msg.at, nombre: msg.fromName ?? undefined })
      .eq("id", contactId);
  } else {
    const { data: created, error } = await db
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
    if (error || !created) throw new Error(`contact: ${error?.message}`);
    contactId = created.id;
  }

  // 2) Conversación abierta del contacto (o nueva)
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
      .update({
        unread: (conv.unread ?? 0) + 1,
        last_message_at: msg.at,
      })
      .eq("id", convId);
  } else {
    const { data: c2, error } = await db
      .from("conversations")
      .insert({
        tenant_id: tenantId,
        contact_id: contactId,
        channel_id: channelId,
        estado: "abierta",
        unread: 1,
        last_message_at: msg.at,
      })
      .select("id")
      .single();
    if (error || !c2) throw new Error(`conversation: ${error?.message}`);
    convId = c2.id;
  }

  // 3) Mensaje entrante
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
}

export interface PendingOutbound {
  id: string;
  contenido: string;
  phone: string;
}

/** Mensajes salientes pendientes del tenant, con teléfono resuelto. */
export async function fetchPendingOutbound(
  tenantId: string,
): Promise<PendingOutbound[]> {
  const { data } = await db
    .from("messages")
    .select("id, contenido, contact:contacts(telefono)")
    .eq("tenant_id", tenantId)
    .eq("direccion", "out")
    .eq("estado", "pendiente")
    .order("created_at", { ascending: true })
    .limit(20);

  return (data ?? [])
    .map((m) => {
      const contact = m.contact as { telefono: string | null } | null;
      return {
        id: m.id as string,
        contenido: (m.contenido as string) ?? "",
        phone: contact?.telefono ?? "",
      };
    })
    .filter((m) => m.phone && m.contenido);
}

export async function markOutbound(
  id: string,
  ok: boolean,
  providerMsgId?: string,
): Promise<void> {
  await db
    .from("messages")
    .update({
      estado: ok ? "enviado" : "fallido",
      provider_msg_id: providerMsgId ?? null,
    })
    .eq("id", id);
}

export async function setChannelEstado(
  channelId: string,
  estado: "conectado" | "desconectado" | "error" | "pendiente",
  extraConfig?: Record<string, unknown>,
): Promise<void> {
  const patch: Record<string, unknown> = { estado };
  if (extraConfig) patch.config = extraConfig;
  await db.from("channels").update(patch).eq("id", channelId);
}
