import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function patientFunnel() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_patient_funnel")
    .select("status, total");
  return (data ?? []).map((r) => ({
    status: r.status ?? "—",
    total: Number(r.total ?? 0),
  }));
}

export async function revenueByProduct() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_revenue_by_product")
    .select("producto, planes, cobrado, facturado");
  return (data ?? []).map((r) => ({
    producto: r.producto ?? "Sin producto",
    planes: Number(r.planes ?? 0),
    cobrado: Number(r.cobrado ?? 0),
    facturado: Number(r.facturado ?? 0),
  }));
}

export async function followupsPendientes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_followups_pendientes")
    .select("tipo, total, vencidos");
  return (data ?? []).map((r) => ({
    tipo: r.tipo ?? "—",
    total: Number(r.total ?? 0),
    vencidos: Number(r.vencidos ?? 0),
  }));
}
