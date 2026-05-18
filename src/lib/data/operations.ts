import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/database.types";

export type DeliveryRow = Database["public"]["Tables"]["deliveries"]["Row"];
export type InventoryRow =
  Database["public"]["Tables"]["inventory_items"]["Row"];
export type FollowUpRow = Database["public"]["Tables"]["follow_ups"]["Row"];

export interface DeliveryWithPatient extends DeliveryRow {
  patient: { apellido: string; nombres: string } | null;
}
export interface FollowUpWithPatient extends FollowUpRow {
  patient: { apellido: string; nombres: string } | null;
}

export async function listDeliveries(): Promise<DeliveryWithPatient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliveries")
    .select("*, patient:patients(apellido, nombres)")
    .order("fecha", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as DeliveryWithPatient[];
}

export async function listInventory(): Promise<
  (InventoryRow & { low: boolean })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("nombre");
  if (error) throw new Error(error.message);
  return (data ?? []).map((i) => ({
    ...i,
    low: Number(i.stock) <= Number(i.minimo),
  }));
}

export async function listFollowUps(opts?: {
  pendingOnly?: boolean;
}): Promise<FollowUpWithPatient[]> {
  const supabase = await createClient();
  let q = supabase
    .from("follow_ups")
    .select("*, patient:patients(apellido, nombres)")
    .order("due_date", { ascending: true })
    .limit(200);
  if (opts?.pendingOnly) q = q.eq("estado", "pendiente");
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as FollowUpWithPatient[];
}

export async function operationsTotals() {
  const [inv, fu] = await Promise.all([listInventory(), listFollowUps()]);
  const today = new Date().toISOString().slice(0, 10);
  return {
    stockBajo: inv.filter((i) => i.low).length,
    seguimientosPendientes: fu.filter((f) => f.estado === "pendiente").length,
    seguimientosVencidos: fu.filter(
      (f) => f.estado === "pendiente" && f.due_date < today,
    ).length,
  };
}
