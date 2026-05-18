import { z } from "zod";

export const CAMPAIGN_ESTADO = [
  "borrador",
  "programada",
  "enviando",
  "enviada",
  "pausada",
  "cancelada",
] as const;
export const CAMPAIGN_ESTADO_LABEL: Record<
  (typeof CAMPAIGN_ESTADO)[number],
  string
> = {
  borrador: "Borrador",
  programada: "Programada",
  enviando: "Enviando",
  enviada: "Enviada",
  pausada: "Pausada",
  cancelada: "Cancelada",
};

export const segmentSchema = z.object({
  nombre: z.string().trim().min(1, "Nombre requerido").max(120),
  descripcion: z.string().trim().max(500).optional(),
  etapa: z
    .string()
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const campaignSchema = z.object({
  nombre: z.string().trim().min(1, "Nombre requerido").max(120),
  segment_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  template_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const automationSchema = z.object({
  nombre: z.string().trim().min(1, "Nombre requerido").max(120),
  preset: z.enum([
    "controles_15_30_60",
    "adherencia",
    "post_servicio",
    "reactivacion",
  ]),
});

export const toggleAutomationSchema = z.object({
  id: z.string().uuid(),
  activo: z.boolean(),
});

export const PRESET_LABEL: Record<string, string> = {
  controles_15_30_60: "Controles 15 / 30 / 60",
  adherencia: "Recordatorio de adherencia",
  post_servicio: "Mensaje post-servicio",
  reactivacion: "Reactivación de inactivos",
};

// ── Builder visual ──
export const TRIGGER_TYPES = [
  "control_vencido",
  "post_servicio",
  "sin_actividad",
  "lead_nuevo",
  "pago_vencido",
] as const;
export const TRIGGER_LABEL: Record<(typeof TRIGGER_TYPES)[number], string> = {
  control_vencido: "Control vencido",
  post_servicio: "Días después de un servicio",
  sin_actividad: "Sin actividad N días",
  lead_nuevo: "Nuevo lead",
  pago_vencido: "Pago vencido",
};

export const ACTION_TYPES = [
  "enviar_whatsapp",
  "esperar_dias",
  "crear_tarea",
  "cambiar_etapa",
] as const;
export const ACTION_LABEL: Record<(typeof ACTION_TYPES)[number], string> = {
  enviar_whatsapp: "Enviar WhatsApp",
  esperar_dias: "Esperar N días",
  crear_tarea: "Crear tarea/nota",
  cambiar_etapa: "Cambiar etapa del contacto",
};

export const automationDefSchema = z.object({
  id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  nombre: z.string().trim().min(1, "Nombre requerido").max(120),
  trigger: z.object({
    type: z.enum(TRIGGER_TYPES),
    conditions: z
      .array(
        z.object({
          field: z.string().trim().max(60),
          op: z.string().trim().max(10),
          value: z.string().trim().max(160),
        }),
      )
      .default([]),
  }),
  acciones: z
    .array(
      z.object({
        type: z.enum(ACTION_TYPES),
        config: z.record(z.string(), z.string()).default({}),
      }),
    )
    .min(1, "Agregá al menos una acción"),
});
export type AutomationDef = z.infer<typeof automationDefSchema>;
