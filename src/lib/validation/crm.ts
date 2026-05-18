import { z } from "zod";

export const CONTACT_ETAPA = [
  "lead",
  "contactado",
  "consulta_agendada",
  "paciente",
  "en_tratamiento",
  "seguimiento",
  "alta",
  "reactivacion",
  "perdido",
] as const;
export const ETAPA_LABEL: Record<(typeof CONTACT_ETAPA)[number], string> = {
  lead: "Lead",
  contactado: "Contactado",
  consulta_agendada: "Consulta agendada",
  paciente: "Paciente",
  en_tratamiento: "En tratamiento",
  seguimiento: "Seguimiento",
  alta: "Alta",
  reactivacion: "Reactivación",
  perdido: "Perdido",
};

export const CONTACT_FUENTE = [
  "facebook",
  "whatsapp",
  "google",
  "referido",
  "walk_in",
  "otro",
] as const;
export const FUENTE_LABEL: Record<(typeof CONTACT_FUENTE)[number], string> = {
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  google: "Google",
  referido: "Referido",
  walk_in: "Espontáneo",
  otro: "Otro",
};

export const contactSchema = z.object({
  nombre: z.string().trim().max(120).optional(),
  telefono: z.string().trim().max(40).optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email inválido")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  fuente: z.enum(CONTACT_FUENTE).default("whatsapp"),
  etapa: z.enum(CONTACT_ETAPA).default("lead"),
  notas: z.string().trim().max(2000).optional(),
});

export const updateStageSchema = z.object({
  id: z.string().uuid(),
  etapa: z.enum(CONTACT_ETAPA),
});

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  contenido: z.string().trim().min(1, "Escribí un mensaje").max(4000),
});

export const templateSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  categoria: z
    .enum([
      "respuesta_rapida",
      "post_servicio",
      "recordatorio",
      "control",
      "reactivacion",
    ])
    .default("respuesta_rapida"),
  cuerpo: z.string().trim().min(1, "Escribí el cuerpo").max(2000),
});

/** Sustituye {{variables}} simples por valores. */
export function renderTemplate(
  body: string,
  vars: Record<string, string>,
): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}
