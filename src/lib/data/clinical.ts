import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/db/database.types";

export type EpisodeRow =
  Database["public"]["Tables"]["clinical_episodes"]["Row"];
export type IntakeRow = Database["public"]["Tables"]["intake_forms"]["Row"];
export type PsychRow = Database["public"]["Tables"]["psych_tests"]["Row"];
export type HistoryRow =
  Database["public"]["Tables"]["clinical_histories"]["Row"];
export type ConsentRow = Database["public"]["Tables"]["consents"]["Row"];
export type NoteRow = Database["public"]["Tables"]["clinical_notes"]["Row"];

export async function listEpisodes(patientId: string): Promise<EpisodeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clinical_episodes")
    .select("*")
    .eq("patient_id", patientId)
    .order("opened_at", { ascending: false });
  return data ?? [];
}

/** Todos los registros estructurados de la HCE del paciente. */
export async function getClinicalRecords(patientId: string) {
  const supabase = await createClient();
  const [intake, psych, history, consents, notes] = await Promise.all([
    supabase
      .from("intake_forms")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("psych_tests")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("clinical_histories")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("consents")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("clinical_notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("fecha", { ascending: false }),
  ]);
  return {
    intake: (intake.data ?? []) as IntakeRow[],
    psych: (psych.data ?? []) as PsychRow[],
    history: (history.data ?? []) as HistoryRow[],
    consents: (consents.data ?? []) as ConsentRow[],
    notes: (notes.data ?? []) as NoteRow[],
  };
}
