import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/database.types";

export type MaxsexProductRow =
  Database["public"]["Tables"]["maxsex_products"]["Row"];
export type MaxsexProductImageRow =
  Database["public"]["Tables"]["maxsex_product_images"]["Row"];

export interface MaxsexOverview {
  productos_totales: number;
  productos_activos: number;
  stock_total: number;
  valor_inventario: number;
  productos_bajo_stock: number;
  lineas_activas: number;
}

const EMPTY_OVERVIEW: MaxsexOverview = {
  productos_totales: 0,
  productos_activos: 0,
  stock_total: 0,
  valor_inventario: 0,
  productos_bajo_stock: 0,
  lineas_activas: 0,
};

/** Catálogo completo (orden manual + alfabético como tiebreaker). */
export async function listProducts(): Promise<MaxsexProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maxsex_products")
    .select("*")
    .order("orden", { ascending: true })
    .order("nombre_corto", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Ficha por slug (incluye galería ordenada). */
export async function getProductBySlug(
  slug: string,
): Promise<
  | (MaxsexProductRow & { galeria: MaxsexProductImageRow[] })
  | null
> {
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("maxsex_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!product) return null;

  const { data: galeria } = await supabase
    .from("maxsex_product_images")
    .select("*")
    .eq("product_id", product.id)
    .order("orden", { ascending: true });

  return { ...product, galeria: galeria ?? [] };
}

/** KPIs para la cabecera del catálogo. */
export async function maxsexOverview(): Promise<MaxsexOverview> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_maxsex_overview")
    .select("*")
    .maybeSingle();
  if (!data) return EMPTY_OVERVIEW;
  return {
    productos_totales: Number(data.productos_totales ?? 0),
    productos_activos: Number(data.productos_activos ?? 0),
    stock_total: Number(data.stock_total ?? 0),
    valor_inventario: Number(data.valor_inventario ?? 0),
    productos_bajo_stock: Number(data.productos_bajo_stock ?? 0),
    lineas_activas: Number(data.lineas_activas ?? 0),
  };
}
