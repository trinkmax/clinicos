/**
 * Worker WhatsApp clinicOS — always-on (Railway/Fly).
 *
 * · Descubre canales tipo `whatsapp_baileys` y abre un socket por canal.
 * · Entrantes → upsert contacto/conversación/mensaje (Realtime los empuja al inbox).
 * · Salientes: poll de `messages` pendientes (direccion=out) → envía → marca estado.
 * · Auth state persistido en `channels.session`. Reconexión automática.
 *
 * La abstracción ChannelProvider permite sumar Meta Cloud API / Facebook
 * sin tocar el orquestador.
 */
import { db } from "./supabase.js";
import { BaileysProvider } from "./baileys-provider.js";
import { MetaCloudProvider } from "./meta-cloud-provider.js";
import { ingestInbound, fetchPendingOutbound, markOutbound } from "./store.js";
import type { ChannelProvider } from "./types.js";

const POLL_MS = Number(process.env.OUTBOUND_POLL_MS ?? 4000);
const providers = new Map<string, ChannelProvider>();

async function discoverAndConnect() {
  const { data: channels, error } = await db
    .from("channels")
    .select("id, tenant_id, tipo, estado")
    .in("tipo", ["whatsapp_baileys", "whatsapp_cloud"]);
  if (error) {
    console.error("No se pudieron leer canales:", error.message);
    return;
  }
  for (const ch of channels ?? []) {
    if (providers.has(ch.id)) continue;
    console.log(
      `Conectando canal ${ch.id} (${ch.tipo}, tenant ${ch.tenant_id})…`,
    );
    const provider: ChannelProvider =
      ch.tipo === "whatsapp_cloud"
        ? new MetaCloudProvider(ch.id, ch.tenant_id)
        : new BaileysProvider(ch.id, ch.tenant_id, async (ctx, msg) => {
            await ingestInbound(ctx.channelId, ctx.tenantId, msg);
          });
    providers.set(ch.id, provider);
    try {
      await provider.connect();
    } catch (e) {
      console.error(`Fallo al conectar ${ch.id}:`, e);
      providers.delete(ch.id);
    }
  }
}

async function pumpOutbound() {
  for (const provider of providers.values()) {
    let pending;
    try {
      pending = await fetchPendingOutbound(provider.tenantId);
    } catch (e) {
      console.error("fetchPendingOutbound:", e);
      continue;
    }
    for (const m of pending) {
      try {
        const { providerMsgId } = await provider.sendText(
          m.phone,
          m.contenido,
        );
        await markOutbound(m.id, true, providerMsgId);
      } catch (e) {
        console.error(`Envío fallido (${m.id}):`, e);
        await markOutbound(m.id, false);
      }
    }
  }
}

async function main() {
  console.log("clinicOS WhatsApp worker — iniciando…");
  await discoverAndConnect();
  // Redescubrir canales nuevos periódicamente + bombear salientes
  setInterval(() => void discoverAndConnect(), 60_000);
  setInterval(() => void pumpOutbound(), POLL_MS);

  const shutdown = async () => {
    console.log("Cerrando worker…");
    for (const p of providers.values()) await p.disconnect();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void main();
