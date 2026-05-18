import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/database.types";

export type SegmentRow = Database["public"]["Tables"]["segments"]["Row"];
export type CampaignRow = Database["public"]["Tables"]["campaigns"]["Row"];
export type AutomationRow =
  Database["public"]["Tables"]["automations"]["Row"];

export async function listSegments(): Promise<SegmentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("segments")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listCampaigns(): Promise<CampaignRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listAutomations(): Promise<AutomationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("automations")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Atribución por fuente: contactos, costo, ingreso, ROI. */
export async function attributionBySource() {
  const supabase = await createClient();
  const [{ data: contacts }, { data: attr }] = await Promise.all([
    supabase.from("contacts").select("fuente"),
    supabase.from("attribution").select("fuente, costo, ingreso"),
  ]);
  const map = new Map<
    string,
    { contactos: number; costo: number; ingreso: number }
  >();
  for (const c of contacts ?? []) {
    const m = map.get(c.fuente) ?? { contactos: 0, costo: 0, ingreso: 0 };
    m.contactos++;
    map.set(c.fuente, m);
  }
  for (const a of attr ?? []) {
    const m = map.get(a.fuente) ?? { contactos: 0, costo: 0, ingreso: 0 };
    m.costo += Number(a.costo);
    m.ingreso += Number(a.ingreso);
    map.set(a.fuente, m);
  }
  return [...map.entries()].map(([fuente, v]) => ({
    fuente,
    ...v,
    roi: v.costo > 0 ? v.ingreso / v.costo : null,
  }));
}

export async function marketingStats() {
  const supabase = await createClient();
  const { count: leads } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("etapa", "lead");
  const { count: pacientes } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("etapa", "paciente");
  const { count: pendientes } = await supabase
    .from("follow_ups")
    .select("id", { count: "exact", head: true })
    .eq("estado", "pendiente");
  return {
    leads: leads ?? 0,
    pacientes: pacientes ?? 0,
    seguimientosPendientes: pendientes ?? 0,
  };
}
