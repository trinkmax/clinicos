import { z } from "zod";

export const APPT_TIPO = ["primera_vez", "control", "segunda_mas"] as const;
export const APPT_MODALIDAD = ["presencial", "videollamada"] as const;
export const APPT_ESTADO = [
  "programado",
  "confirmado",
  "presente",
  "atendido",
  "ausente",
  "cancelado",
] as const;

export const TIPO_LABEL: Record<(typeof APPT_TIPO)[number], string> = {
  primera_vez: "1ª vez",
  control: "Control",
  segunda_mas: "2ª y +",
};
export const ESTADO_LABEL: Record<(typeof APPT_ESTADO)[number], string> = {
  programado: "Programado",
  confirmado: "Confirmado",
  presente: "Presente",
  atendido: "Atendido",
  ausente: "Ausente",
  cancelado: "Cancelado",
};

export const appointmentSchema = z
  .object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "Fecha inválida"),
    hora: z.string().regex(/^\d{2}:\d{2}$/u, "Hora inválida"),
    duracion_min: z.coerce.number().int().min(5).max(240).default(45),
    tipo: z.enum(APPT_TIPO).default("primera_vez"),
    modalidad: z.enum(APPT_MODALIDAD).default("presencial"),
    patient_id: z
      .string()
      .uuid()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    profesional_id: z
      .string()
      .uuid()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    nombre_contacto: z.string().trim().max(120).optional(),
    telefono_contacto: z.string().trim().max(40).optional(),
    virtual_flexible: z.coerce.boolean().default(false),
    notas: z.string().trim().max(1000).optional(),
  })
  .refine((d) => d.patient_id || d.nombre_contacto, {
    message: "Indicá un paciente o al menos un nombre de contacto",
    path: ["nombre_contacto"],
  });

export type AppointmentInput = z.infer<typeof appointmentSchema>;
