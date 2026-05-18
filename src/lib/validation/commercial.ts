import { z } from "zod";

export const PLAN_ESTADO = [
  "activo",
  "completado",
  "cancelado",
  "en_mora",
] as const;

export const PLAN_ESTADO_LABEL: Record<
  (typeof PLAN_ESTADO)[number],
  string
> = {
  activo: "Activo",
  completado: "Completado",
  cancelado: "Cancelado",
  en_mora: "En mora",
};

export const productSchema = z.object({
  codigo: z.string().trim().min(1, "Código requerido").max(40),
  nombre: z.string().trim().min(1, "Nombre requerido").max(160),
  precio: z.coerce.number().min(0).default(0),
  aplicaciones: z.coerce.number().int().min(1).default(1),
});
export type ProductInput = z.infer<typeof productSchema>;

export const treatmentPlanSchema = z.object({
  patient_id: z.string().uuid("Paciente inválido"),
  product_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  descripcion: z.string().trim().max(200).optional(),
  costo_total: z.coerce.number().min(0),
  cant_aplicaciones: z.coerce.number().int().min(0).default(0),
  inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notas: z.string().trim().max(1000).optional(),
});
export type TreatmentPlanInput = z.infer<typeof treatmentPlanSchema>;

export const paymentSchema = z.object({
  plan_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  importe: z.coerce.number().positive("El importe debe ser mayor a 0"),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  medio: z.string().trim().max(60).optional(),
  notas: z.string().trim().max(500).optional(),
});
export type PaymentInput = z.infer<typeof paymentSchema>;

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}
