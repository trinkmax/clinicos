import { z } from "zod";

import type { Database } from "@/lib/db/database.types";

export type MaxsexLinea = Database["public"]["Enums"]["maxsex_linea"];
export type MaxsexAudiencia = Database["public"]["Enums"]["maxsex_audiencia"];

export const MAXSEX_LINEA = [
  "active",
  "active_fem",
  "action",
  "action_plus",
  "control",
] as const satisfies readonly MaxsexLinea[];

export const MAXSEX_AUDIENCIA = [
  "hombre",
  "mujer",
  "unisex",
] as const satisfies readonly MaxsexAudiencia[];

export const MAXSEX_LINEA_LABEL: Record<MaxsexLinea, string> = {
  active: "Active",
  active_fem: "Active FEM",
  action: "Action",
  action_plus: "Action Plus",
  control: "Control",
};

export const MAXSEX_LINEA_KICKER: Record<MaxsexLinea, string> = {
  active: "Energía cotidiana",
  active_fem: "Bienestar femenino",
  action: "Disfunción eréctil",
  action_plus: "Máximo desempeño",
  control: "Eyaculación precoz",
};

export const MAXSEX_AUDIENCIA_LABEL: Record<MaxsexAudiencia, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
  unisex: "Hombre y mujer",
};

export const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/u, "Solo minúsculas, números y guiones"),
  sku: z.string().trim().max(40).optional(),
  linea: z.enum(MAXSEX_LINEA),
  nombre_corto: z.string().trim().min(2).max(80),
  nombre_completo: z.string().trim().max(160).optional(),
  tagline: z.string().trim().max(80).default("POTENCIA TU INTIMIDAD"),
  color_hex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/u, "Color hexadecimal inválido"),
  color_oklch: z.string().trim().min(5).max(60),
  audiencia: z.enum(MAXSEX_AUDIENCIA).default("unisex"),
  indicacion_titulo: z.string().trim().max(120).optional(),
  indicacion_descripcion: z.string().trim().max(800).optional(),
  descripcion_corta: z.string().trim().min(8).max(280),
  descripcion_larga: z.string().trim().max(2000).optional(),
  beneficios: z.array(z.string().trim().min(1).max(40)).max(6).default([]),
  presentacion: z.string().trim().max(40).default("30 cápsulas"),
  unidades_por_envase: z.coerce.number().int().min(1).default(30),
  composicion: z.string().trim().max(800).optional(),
  modo_uso: z.string().trim().max(400).optional(),
  advertencias: z.string().trim().max(800).optional(),
  rnpa: z.string().trim().max(40).optional(),
  precio: z.coerce.number().min(0).default(0),
  precio_promo: z.coerce.number().min(0).optional(),
  stock_actual: z.coerce.number().int().min(0).default(0),
  stock_minimo: z.coerce.number().int().min(0).default(5),
  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),
  orden: z.coerce.number().int().default(0),
});

export type ProductInput = z.infer<typeof productSchema>;

/** ARS formatter (sin decimales para precios redondos). */
export function formatARS(n: number | null | undefined): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(n ?? 0));
}

/** Estado de stock derivado: 'sin_stock' | 'bajo' | 'ok'. */
export function stockStatus(
  actual: number,
  minimo: number,
): "sin_stock" | "bajo" | "ok" {
  if (actual <= 0) return "sin_stock";
  if (actual <= minimo) return "bajo";
  return "ok";
}
