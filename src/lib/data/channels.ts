import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Vista segura de un canal para la UI. NUNCA expone `session` (credenciales
 * Baileys) ni el `graph_token` de Meta — solo si está configurado.
 */
export interface ChannelView {
  id: string;
  tipo: string;
  nombre: string;
  estado: string;
  updated_at: string;
  /** QR de vinculación (data URL) — transitorio, solo owner/admin. */
  qr: string | null;
  qr_at: string | null;
  phone_number_id: string | null;
  waba_id: string | null;
  graph_version: string | null;
  hasToken: boolean;
}

export async function listChannels(): Promise<ChannelView[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("channels")
    .select("id, tipo, nombre, estado, updated_at, config")
    .order("created_at", { ascending: true });

  return (data ?? []).map((c) => {
    const cfg = (c.config ?? {}) as Record<string, unknown>;
    return {
      id: c.id,
      tipo: c.tipo,
      nombre: c.nombre,
      estado: c.estado,
      updated_at: c.updated_at,
      qr: typeof cfg.qr === "string" ? cfg.qr : null,
      qr_at: typeof cfg.qr_at === "string" ? cfg.qr_at : null,
      phone_number_id:
        typeof cfg.phone_number_id === "string"
          ? cfg.phone_number_id
          : null,
      waba_id: typeof cfg.waba_id === "string" ? cfg.waba_id : null,
      graph_version:
        typeof cfg.graph_version === "string" ? cfg.graph_version : null,
      hasToken:
        typeof cfg.graph_token === "string" && cfg.graph_token.length > 0,
    };
  });
}
