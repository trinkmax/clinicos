import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  initAuthCreds,
  BufferJSON,
  type AuthenticationState,
  type SignalDataTypeMap,
} from "@whiskeysockets/baileys";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY (worker).",
  );
}

/** Cliente service-role. Bypasea RLS → SIEMPRE filtrar por tenant_id del channel. */
export const db: SupabaseClient = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Auth state de Baileys persistido en `channels.session` (jsonb).
 * Serializa con BufferJSON (maneja Buffers). Una fila por channel.
 */
export async function supabaseAuthState(channelId: string): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  const { data } = await db
    .from("channels")
    .select("session")
    .eq("id", channelId)
    .single();

  const raw = (data?.session ?? {}) as { creds?: unknown; keys?: unknown };
  const creds = raw.creds
    ? JSON.parse(JSON.stringify(raw.creds), BufferJSON.reviver)
    : initAuthCreds();
  const keys: Record<string, Record<string, unknown>> = raw.keys
    ? JSON.parse(JSON.stringify(raw.keys), BufferJSON.reviver)
    : {};

  async function persist() {
    const session = JSON.parse(
      JSON.stringify({ creds, keys }, BufferJSON.replacer),
    );
    await db
      .from("channels")
      .update({ session, estado: "conectado" })
      .eq("id", channelId);
  }

  const state: AuthenticationState = {
    creds,
    keys: {
      get: (type, ids) => {
        const bucket = keys[type] ?? {};
        const out: Record<string, unknown> = {};
        for (const id of ids) if (bucket[id]) out[id] = bucket[id];
        return out as Record<
          string,
          SignalDataTypeMap[typeof type] | undefined
        >;
      },
      set: async (data) => {
        for (const type of Object.keys(data)) {
          keys[type] = {
            ...(keys[type] ?? {}),
            ...(data as Record<string, Record<string, unknown>>)[type],
          };
        }
        await persist();
      },
    },
  };

  return { state, saveCreds: persist };
}
