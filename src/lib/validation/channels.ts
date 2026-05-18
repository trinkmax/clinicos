import { z } from "zod";

/** Tipos de canal configurables desde la UI (los demás llegan por integración). */
export const CHANNEL_TIPO_UI = [
  "whatsapp_baileys",
  "whatsapp_cloud",
] as const;

export const CHANNEL_TIPO_LABEL: Record<string, string> = {
  whatsapp_baileys: "WhatsApp (QR · Baileys)",
  whatsapp_cloud: "WhatsApp API (Meta Cloud)",
  facebook: "Facebook",
  instagram: "Instagram",
  manual: "Manual",
};

export const CHANNEL_ESTADO_LABEL: Record<string, string> = {
  conectado: "Conectado",
  pendiente: "Pendiente",
  desconectado: "Desconectado",
  error: "Error",
};

export const createChannelSchema = z.object({
  tipo: z.enum(CHANNEL_TIPO_UI),
  nombre: z.string().trim().min(1, "Poné un nombre").max(80),
});
export type CreateChannelInput = z.infer<typeof createChannelSchema>;

export const metaConfigSchema = z.object({
  id: z.string().uuid(),
  phone_number_id: z
    .string()
    .trim()
    .regex(/^\d{6,24}$/u, "Solo dígitos (Phone Number ID de Meta)"),
  waba_id: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  graph_token: z
    .string()
    .trim()
    .min(20, "Token demasiado corto")
    .max(400)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  graph_version: z
    .string()
    .trim()
    .regex(/^v\d{1,3}\.\d{1,3}$/u, "Formato vNN.N (ej. v21.0)")
    .default("v21.0"),
});
export type MetaConfigInput = z.infer<typeof metaConfigSchema>;

export const channelIdSchema = z.object({ id: z.string().uuid() });
