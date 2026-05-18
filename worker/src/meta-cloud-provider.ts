import { db } from "./supabase.js";
import { setChannelEstado } from "./store.js";
import type { ChannelProvider } from "./types.js";

/**
 * WhatsApp Cloud API (Meta) — ChannelProvider HTTP (sin socket persistente).
 * Salientes: Graph API. Entrantes: llegan por el webhook /api/webhooks/meta
 * de la app Next (no por el worker). config del canal:
 *   { phone_number_id, graph_token, graph_version? }
 */
export class MetaCloudProvider implements ChannelProvider {
  private phoneNumberId = "";
  private token = "";
  private version = "v21.0";

  constructor(
    public readonly channelId: string,
    public readonly tenantId: string,
  ) {}

  async connect(): Promise<void> {
    const { data } = await db
      .from("channels")
      .select("config")
      .eq("id", this.channelId)
      .single();
    const cfg = (data?.config ?? {}) as {
      phone_number_id?: string;
      graph_token?: string;
      graph_version?: string;
    };
    this.phoneNumberId = cfg.phone_number_id ?? "";
    this.token = cfg.graph_token ?? "";
    this.version = cfg.graph_version ?? "v21.0";
    await setChannelEstado(
      this.channelId,
      this.phoneNumberId && this.token ? "conectado" : "pendiente",
    );
  }

  async sendText(
    toPhone: string,
    text: string,
  ): Promise<{ providerMsgId: string }> {
    if (!this.phoneNumberId || !this.token)
      throw new Error("Canal Cloud sin phone_number_id/graph_token");
    const res = await fetch(
      `https://graph.facebook.com/${this.version}/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toPhone.replace(/\D/g, ""),
          type: "text",
          text: { body: text },
        }),
      },
    );
    if (!res.ok) {
      throw new Error(`Graph API ${res.status}: ${await res.text()}`);
    }
    const json = (await res.json()) as {
      messages?: { id?: string }[];
    };
    return { providerMsgId: json.messages?.[0]?.id ?? "" };
  }

  async disconnect(): Promise<void> {
    /* sin socket */
  }
}
