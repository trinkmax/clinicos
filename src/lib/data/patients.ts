import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/database.types";

export type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

/** Lista/búsqueda de pacientes del tenant (RLS aísla el tenant). */
export async function listPatients(opts: {
  q?: string;
  status?: PatientRow["status"];
  limit?: number;
}): Promise<PatientRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("patients")
    .select("*")
    .order("apellido", { ascending: true })
    .limit(opts.limit ?? 50);

  if (opts.status) query = query.eq("status", opts.status);

  const q = opts.q?.trim();
  if (q) {
    const like = `%${q}%`;
    query = query.or(
      `apellido.ilike.${like},nombres.ilike.${like},dni.ilike.${like},telefono.ilike.${like}`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPatient(id: string): Promise<PatientRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}

export async function getPatientDocuments(patientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("patient_documents")
    .select("*, document_extractions(*)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function patientCounters() {
  const supabase = await createClient();
  const { count: total } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true });
  const { count: enTratamiento } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true })
    .eq("status", "en_tratamiento");
  return { total: total ?? 0, enTratamiento: enTratamiento ?? 0 };
}
