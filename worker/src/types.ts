/** Mensaje entrante normalizado, agnóstico del canal. */
export interface InboundMessage {
  fromPhone: string;
  fromName?: string;
  text: string;
  providerMsgId?: string;
  at: string;
}

/**
 * Abstracción de canal de mensajería. BaileysProvider la implementa hoy;
 * MetaCloudProvider / FacebookProvider se enchufan después sin tocar el resto.
 */
export interface ChannelProvider {
  readonly channelId: string;
  readonly tenantId: string;
  connect(): Promise<void>;
  sendText(toPhone: string, text: string): Promise<{ providerMsgId: string }>;
  disconnect(): Promise<void>;
}

export type InboundHandler = (
  ctx: { channelId: string; tenantId: string },
  msg: InboundMessage,
) => Promise<void>;
