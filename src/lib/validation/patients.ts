import { z } from "zod";

/** Domicilio (de la Ficha de Ingreso). */
export const domicilioSchema = z.object({
  calle: z.string().trim().max(160).optional().default(""),
  nro: z.string().trim().max(20).optional().default(""),
  piso: z.string().trim().max(10).optional().default(""),
  dpto: z.string().trim().max(10).optional().default(""),
  barrio: z.string().trim().max(120).optional().default(""),
  localidad: z.string().trim().max(120).optional().default(""),
  provincia: z.string().trim().max(120).optional().default(""),
  cp: z.string().trim().max(12).optional().default(""),
});
export type Domicilio = z.infer<typeof domicilioSchema>;

const dni = z
  .string()
  .trim()
  .regex(/^[0-9.]{6,12}$/u, "DNI inválido")
  .transform((v) => v.replace(/\D/g, ""))
  .optional()
  .or(z.literal("").transform(() => undefined));

export const patientSchema = z.object({
  apellido: z.string().trim().min(1, "Ingresá el apellido").max(120),
  nombres: z.string().trim().min(1, "Ingresá los nombres").max(120),
  dni: dni,
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u, "Fecha inválida")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  estado_civil: z.string().trim().max(40).optional(),
  sexo: z.enum(["M", "F", "X"]).default("M"),
  telefono: z.string().trim().max(40).optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email inválido")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  ocupacion: z.string().trim().max(120).optional(),
  domicilio: domicilioSchema.optional(),
  notas: z.string().trim().max(2000).optional(),
});
export type PatientInput = z.infer<typeof patientSchema>;

export const patientSearchSchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z
    .enum(["activo", "en_tratamiento", "alta", "inactivo"])
    .optional(),
});

export function patientFullName(p: { apellido: string; nombres: string }) {
  return `${p.apellido}, ${p.nombres}`;
}

export function patientAge(fecha_nacimiento: string | null): number | null {
  if (!fecha_nacimiento) return null;
  const b = new Date(fecha_nacimiento);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
