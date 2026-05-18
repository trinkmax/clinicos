import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/database.types";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export interface PlanWithSaldo {
  id: string;
  patient_id: string;
  descripcion: string | null;
  costo_total: number;
  cant_aplicaciones: number;
  estado: Database["public"]["Enums"]["plan_estado"];
  inicio: string | null;
  created_at: string;
  pagado: number;
  saldo: number;
  patient: { apellido: string; nombres: string } | null;
  product: { codigo: string } | null;
}

export async function listProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("codigo");
  return data ?? [];
}

/** Planes con saldo = costo_total − Σ pagos (calculado al vuelo). */
export async function listPlansWithSaldo(): Promise<PlanWithSaldo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("treatment_plans")
    .select(
      "id, patient_id, descripcion, costo_total, cant_aplicaciones, estado, inicio, created_at, patient:patients(apellido, nombres), product:products(codigo), payments(importe)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => {
    const pays = (p.payments ?? []) as { importe: number }[];
    const pagado = pays.reduce((s, x) => s + Number(x.importe), 0);
    const costo = Number(p.costo_total);
    return {
      id: p.id,
      patient_id: p.patient_id,
      descripcion: p.descripcion,
      costo_total: costo,
      cant_aplicaciones: p.cant_aplicaciones,
      estado: p.estado,
      inicio: p.inicio,
      created_at: p.created_at,
      pagado,
      saldo: costo - pagado,
      patient: (p.patient as PlanWithSaldo["patient"]) ?? null,
      product: (p.product as PlanWithSaldo["product"]) ?? null,
    };
  });
}

export async function commercialTotals() {
  const plans = await listPlansWithSaldo();
  return {
    planes: plans.length,
    facturado: plans.reduce((s, p) => s + p.costo_total, 0),
    cobrado: plans.reduce((s, p) => s + p.pagado, 0),
    saldo: plans.reduce((s, p) => s + p.saldo, 0),
  };
}
