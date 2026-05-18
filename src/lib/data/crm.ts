import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/database.types";

export type ContactRow = Database["public"]["Tables"]["contacts"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type TemplateRow =
  Database["public"]["Tables"]["message_templates"]["Row"];

export interface ConversationListItem {
  id: string;
  estado: Database["public"]["Enums"]["conv_estado"];
  unread: number;
  last_message_at: string | null;
  contact: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    fuente: Database["public"]["Enums"]["contact_fuente"];
    etapa: Database["public"]["Enums"]["contact_etapa"];
  } | null;
}

export async function listConversations(): Promise<ConversationListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, estado, unread, last_message_at, contact:contacts(id, nombre, telefono, fuente, etapa)",
    )
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ConversationListItem[];
}

export async function getConversation(id: string) {
  const supabase = await createClient();
  const { data: conv } = await supabase
    .from("conversations")
    .select("*, contact:contacts(*)")
    .eq("id", id)
    .maybeSingle();
  if (!conv) return null;
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(500);
  return { conversation: conv, messages: (messages ?? []) as MessageRow[] };
}

export async function listContacts(
  etapa?: ContactRow["etapa"],
): Promise<ContactRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("contacts")
    .select("*")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(200);
  if (etapa) q = q.eq("etapa", etapa);
  const { data } = await q;
  return data ?? [];
}

export async function listTemplates(): Promise<TemplateRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("message_templates")
    .select("*")
    .eq("activo", true)
    .order("categoria");
  return data ?? [];
}

export async function crmStats() {
  const supabase = await createClient();
  const { count: convAbiertas } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("estado", "abierta");
  const { count: leads } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("etapa", "lead");
  return { convAbiertas: convAbiertas ?? 0, leads: leads ?? 0 };
}
