import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  type WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";

import { supabaseAuthState } from "./supabase.js";
import { setChannelEstado } from "./store.js";
import type { ChannelProvider, InboundHandler } from "./types.js";

const logger = pino({ level: "silent" });

function phoneFromJid(jid: string): string {
  return jid.split("@")[0]!.split(":")[0]!;
}

export class BaileysProvider implements ChannelProvider {
  private sock: WASocket | null = null;
  private closing = false;

  constructor(
    public readonly channelId: string,
    public readonly tenantId: string,
    private readonly onInbound: InboundHandler,
  ) {}

  async connect(): Promise<void> {
    const { state, saveCreds } = await supabaseAuthState(this.channelId);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({ version, auth: state, logger });
    this.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (u) => {
      const { connection, lastDisconnect, qr } = u;
      if (qr) {
        const dataUrl = await QRCode.toDataURL(qr);
        await setChannelEstado(this.channelId, "pendiente", {
          qr: dataUrl,
          qr_at: new Date().toISOString(),
        });
        console.log(`[${this.channelId}] QR generado — escanealo en Ajustes.`);
      }
      if (connection === "open") {
        await setChannelEstado(this.channelId, "conectado", { qr: null });
        console.log(`[${this.channelId}] WhatsApp conectado.`);
      }
      if (connection === "close") {
        const code = (
          lastDisconnect?.error as
            | { output?: { statusCode?: number } }
            | undefined
        )?.output?.statusCode;
        const loggedOut = code === DisconnectReason.loggedOut;
        await setChannelEstado(
          this.channelId,
          loggedOut ? "desconectado" : "error",
        );
        if (!loggedOut && !this.closing) {
          console.log(`[${this.channelId}] Reconectando…`);
          setTimeout(() => void this.connect(), 3000);
        }
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const m of messages) {
        if (m.key.fromMe || !m.key.remoteJid) continue;
        if (m.key.remoteJid.endsWith("@g.us")) continue; // ignorar grupos
        const text =
          m.message?.conversation ??
          m.message?.extendedTextMessage?.text ??
          m.message?.imageMessage?.caption ??
          "";
        if (!text) continue;
        try {
          await this.onInbound(
            { channelId: this.channelId, tenantId: this.tenantId },
            {
              fromPhone: phoneFromJid(m.key.remoteJid),
              fromName: m.pushName ?? undefined,
              text,
              providerMsgId: m.key.id ?? undefined,
              at: new Date(
                Number(m.messageTimestamp ?? Date.now() / 1000) * 1000,
              ).toISOString(),
            },
          );
        } catch (e) {
          console.error(`[${this.channelId}] inbound error`, e);
        }
      }
    });
  }

  async sendText(
    toPhone: string,
    text: string,
  ): Promise<{ providerMsgId: string }> {
    if (!this.sock) throw new Error("Socket no conectado");
    const jid = `${toPhone.replace(/\D/g, "")}@s.whatsapp.net`;
    const res = await this.sock.sendMessage(jid, { text });
    return { providerMsgId: res?.key.id ?? "" };
  }

  async disconnect(): Promise<void> {
    this.closing = true;
    this.sock?.end(undefined);
  }
}
