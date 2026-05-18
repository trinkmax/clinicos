import { z } from "zod";

export const CONDICIONES = [
  "disfuncion_erectil",
  "eyaculacion_precoz",
  "deficit_testosterona",
  "peyronie",
] as const;
export const CONDICION_LABEL: Record<(typeof CONDICIONES)[number], string> = {
  disfuncion_erectil: "Disfunción eréctil",
  eyaculacion_precoz: "Eyaculación precoz",
  deficit_testosterona: "Déficit de testosterona",
  peyronie: "Síndrome de Peyronie",
};

export const EPISODE_ESTADO = [
  "intake",
  "evaluacion",
  "diagnostico",
  "tratamiento",
  "seguimiento",
  "alta",
  "baja",
] as const;
export const EPISODE_ESTADO_LABEL: Record<
  (typeof EPISODE_ESTADO)[number],
  string
> = {
  intake: "Admisión",
  evaluacion: "Evaluación",
  diagnostico: "Diagnóstico",
  tratamiento: "Tratamiento",
  seguimiento: "Seguimiento",
  alta: "Alta",
  baja: "Baja",
};

export const episodeSchema = z.object({
  patient_id: z.string().uuid(),
  condiciones: z.array(z.enum(CONDICIONES)).default([]),
});

export const updateEpisodeSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(EPISODE_ESTADO),
});

export const noteSchema = z.object({
  patient_id: z.string().uuid(),
  episode_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  tipo: z
    .enum(["nota", "seguimiento", "control_15", "control_30", "control_60"])
    .default("nota"),
  contenido: z.string().trim().min(1, "Escribí la nota").max(4000),
});

export const promoteSchema = z.object({
  extraction_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  episode_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const signHistorySchema = z.object({
  id: z.string().uuid(),
  signature_data: z.string().min(10, "Firma requerida").max(500_000),
});
