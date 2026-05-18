import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/database.types";

export type AppointmentRow =
  Database["public"]["Tables"]["appointments"]["Row"];

export interface AppointmentWithPatient extends AppointmentRow {
  patient: { id: string; apellido: string; nombres: string } | null;
}

/** Turnos de una fecha (con datos mínimos del paciente). Ordenados por hora. */
export async function listAppointmentsByDate(
  fecha: string,
): Promise<AppointmentWithPatient[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patient:patients(id, apellido, nombres)")
    .eq("fecha", fecha)
    .order("hora", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AppointmentWithPatient[];
}

export interface Professional {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string;
}

/**
 * Profesionales/asesores del tenant — columnas de la agenda.
 * Se mapean luego por membership.id o user_id (FK histórica no estricta).
 */
export async function listProfessionals(): Promise<Professional[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("id, user_id, full_name, role, status")
    .in("role", ["profesional", "asesor", "owner", "admin"])
    .order("full_name", { ascending: true, nullsFirst: false });
  return (data ?? [])
    .filter((m) => m.status !== "revocado" && m.status !== "inactivo")
    .map((m) => ({
      id: m.id,
      user_id: m.user_id,
      full_name: m.full_name,
      role: m.role,
    }));
}

export async function appointmentDayStats(fecha: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("estado, abono")
    .eq("fecha", fecha);
  const rows = data ?? [];
  return {
    total: rows.length,
    atendidos: rows.filter((r) => r.estado === "atendido").length,
    abonaron: rows.filter((r) => r.abono).length,
  };
}
