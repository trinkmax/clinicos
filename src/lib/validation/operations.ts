import { z } from "zod";

export const FOLLOWUP_TIPO = [
  "control_15",
  "control_30",
  "control_60",
  "adherencia",
] as const;
export const FOLLOWUP_ESTADO = [
  "pendiente",
  "hecho",
  "omitido",
  "reprogramado",
] as const;
export const STOCK_MOV = ["entrada", "salida", "ajuste"] as const;

export const FOLLOWUP_TIPO_LABEL: Record<
  (typeof FOLLOWUP_TIPO)[number],
  string
> = {
  control_15: "Control 15 días",
  control_30: "Control 30 días",
  control_60: "Control 60 días",
  adherencia: "Adherencia",
};
export const FOLLOWUP_ESTADO_LABEL: Record<
  (typeof FOLLOWUP_ESTADO)[number],
  string
> = {
  pendiente: "Pendiente",
  hecho: "Hecho",
  omitido: "Omitido",
  reprogramado: "Reprogramado",
};

export const deliverySchema = z.object({
  plan_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  patient_id: z.string().uuid("Paciente requerido"),
  cantidad: z.coerce.number().int().min(1).default(1),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  detalle: z.string().trim().max(300).optional(),
  descontar_stock_item_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type DeliveryInput = z.infer<typeof deliverySchema>;

export const inventoryItemSchema = z.object({
  nombre: z.string().trim().min(1, "Nombre requerido").max(120),
  unidad: z.string().trim().max(40).default("aplicación"),
  stock: z.coerce.number().min(0).default(0),
  minimo: z.coerce.number().min(0).default(0),
  product_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;

export const stockMovementSchema = z.object({
  item_id: z.string().uuid(),
  tipo: z.enum(STOCK_MOV),
  cantidad: z.coerce.number().positive("Cantidad mayor a 0"),
  motivo: z.string().trim().max(200).optional(),
});
export type StockMovementInput = z.infer<typeof stockMovementSchema>;

export const completeFollowUpSchema = z.object({
  id: z.string().uuid(),
  estado: z.enum(["hecho", "omitido", "reprogramado"]),
  resultado: z.string().trim().max(500).optional(),
});

export const scheduleFollowUpsSchema = z.object({
  plan_id: z.string().uuid(),
});
