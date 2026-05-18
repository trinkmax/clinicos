"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/auth/roles";
import { action, type ActionResult } from "@/lib/actions/result";
import {
  episodeSchema,
  updateEpisodeSchema,
  noteSchema,
  promoteSchema,
  signHistorySchema,
} from "@/lib/validation/clinical";
import type { Json } from "@/lib/db/database.types";

const CLIN = [
  ROLES.owner,
  ROLES.admin,
  ROLES.profesional,
  ROLES.asesor,
] as const;
const asJson = (v: unknown) => v as unknown as Json;

export async function createEpisode(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: CLIN, schema: episodeSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("clinical_episodes")
        .insert({
          tenant_id: ctx.tenantId,
          patient_id: data.patient_id,
          condiciones: data.condiciones,
          profesional_id: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath(`/pacientes/${data.patient_id}`);
      return { id: row.id };
    },
  );
}

export async function updateEpisodeStatus(
  id: string,
  status: string,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: CLIN, schema: updateEpisodeSchema, input: { id, status } },
    async (data, ctx) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("clinical_episodes")
        .update({
          status: data.status,
          closed_at:
            data.status === "alta" || data.status === "baja"
              ? new Date().toISOString()
              : null,
        })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath("/pacientes");
      return { id: data.id };
    },
  );
}

/** Promueve una extracción validada → registro estructurado legal de la HCE. */
export async function promoteExtraction(
  input: unknown,
): Promise<ActionResult<{ tabla: string }>> {
  return action(
    { roles: CLIN, schema: promoteSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: ext, error } = await supabase
        .from("document_extractions")
        .select("data, doc_type, document_id, status")
        .eq("id", data.extraction_id)
        .single();
      if (error || !ext) throw new Error("Extracción no encontrada.");
      if (ext.status !== "validated")
        throw new Error("Validá la extracción antes de promoverla a la HCE.");

      const d = (ext.data ?? {}) as Record<string, unknown>;
      const common = {
        tenant_id: ctx.tenantId,
        patient_id: data.patient_id,
        episode_id: data.episode_id ?? null,
        document_id: ext.document_id,
        created_by: ctx.userId,
      };

      if (ext.doc_type === "ficha_ingreso") {
        const { error: e } = await supabase.from("intake_forms").insert({
          ...common,
          sintomas: asJson(d.sintomas ?? {}),
          condiciones: asJson(d.condiciones ?? {}),
          diagnostico: (d.diagnostico as string) ?? null,
          tratamiento: (d.tratamiento as string) ?? null,
        });
        if (e) throw new Error(e.message);
        return { tabla: "Ficha de Ingreso" };
      }
      if (ext.doc_type === "test_psicologico") {
        const { error: e } = await supabase.from("psych_tests").insert({
          ...common,
          respuestas: asJson(d.respuestas ?? d),
          asesor_id: ctx.userId,
        });
        if (e) throw new Error(e.message);
        return { tabla: "Test Psicológico" };
      }
      if (ext.doc_type === "historia_clinica") {
        const { error: e } = await supabase
          .from("clinical_histories")
          .insert({
            ...common,
            profesional_id: ctx.userId,
            datos_personales: asJson(d.datos_personales ?? {}),
            motivo_consulta: asJson(d.motivo_consulta ?? {}),
            disfuncion_erectil: asJson(d.disfuncion_erectil ?? {}),
            eyaculacion_precoz: asJson(d.eyaculacion_precoz ?? {}),
            deseo_sexual: asJson(d.deseo_sexual ?? {}),
            antecedentes: asJson(d.antecedentes ?? {}),
            examen_fisico: asJson(d.examen_fisico ?? {}),
            ecodoppler: asJson(d.ecodoppler ?? {}),
            estudios: asJson(d.estudios ?? {}),
            diagnostico: (d.diagnostico as string) ?? null,
            plan: (d.plan as string) ?? null,
            tratamiento: asJson(d.tratamiento ?? []),
            seguimiento: asJson(d.seguimiento ?? []),
          });
        if (e) throw new Error(e.message);
        return { tabla: "Historia Clínica" };
      }
      if (ext.doc_type === "consentimiento") {
        const { error: e } = await supabase.from("consents").insert({
          ...common,
          signer_name: (d.signer_name as string) ?? null,
          signer_dni: (d.signer_dni as string) ?? null,
          signed_at: d.firmado ? new Date().toISOString() : null,
          signature_method: "wet_ink_scanned",
          trazabilidad: asJson({ origen: "escaneo", validado_por: ctx.userId }),
          status: d.firmado ? "signed" : "draft",
        });
        if (e) throw new Error(e.message);
        return { tabla: "Consentimiento" };
      }
      throw new Error(
        "Este tipo de documento no se promueve a la HCE (no clínico).",
      );
    },
  );
}

/** Firma electrónica avanzada del profesional + cierre de la HC (Ley 26.529). */
export async function signClinicalHistory(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: [ROLES.owner, ROLES.admin, ROLES.profesional],
      schema: signHistorySchema,
      input,
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const h = await headers();
      const ip =
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
      const ua = h.get("user-agent") ?? null;
      const ts = new Date().toISOString();
      const payloadHash = createHash("sha256")
        .update(`${data.id}|${ctx.userId}|${ts}|${data.signature_data}`)
        .digest("hex");

      const { data: hc, error: e1 } = await supabase
        .from("clinical_histories")
        .update({ status: "signed", signed_by: ctx.userId, signed_at: ts })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId)
        .select("id")
        .single();
      if (e1)
        throw new Error(
          e1.message.includes("inmutable")
            ? "La HC ya estaba firmada/cerrada."
            : e1.message,
        );

      const { error: e2 } = await supabase.from("signatures").insert({
        tenant_id: ctx.tenantId,
        entity_table: "clinical_histories",
        entity_id: data.id,
        signer_type: "professional",
        signer_user_id: ctx.userId,
        signer_name: ctx.email,
        method: "drawn",
        payload_sha256: payloadHash,
        ip,
        user_agent: ua,
        geo: asJson({}),
      });
      if (e2) throw new Error(e2.message);
      revalidatePath("/pacientes");
      return { id: hc.id };
    },
  );
}

export async function addClinicalNote(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: CLIN, schema: noteSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("clinical_notes")
        .insert({
          tenant_id: ctx.tenantId,
          patient_id: data.patient_id,
          episode_id: data.episode_id ?? null,
          tipo: data.tipo,
          contenido: data.contenido,
          profesional_id: ctx.userId,
          created_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath(`/pacientes/${data.patient_id}`);
      return { id: row.id };
    },
  );
}

/** URL firmada (TTL corto) para ver el escaneo original. */
export async function getDocumentSignedUrl(
  documentId: string,
): Promise<ActionResult<{ url: string }>> {
  return action(
    {
      roles: [
        ROLES.owner,
        ROLES.admin,
        ROLES.recepcion,
        ROLES.profesional,
        ROLES.asesor,
      ],
      schema: z.object({ documentId: z.string().uuid() }),
      input: { documentId },
    },
    async (d) => {
      const supabase = await createClient();
      const { data: doc, error } = await supabase
        .from("patient_documents")
        .select("storage_path")
        .eq("id", d.documentId)
        .single();
      if (error || !doc) throw new Error("Documento no encontrado.");
      const { data: signed, error: e2 } = await supabase.storage
        .from("patient-documents")
        .createSignedUrl(doc.storage_path, 300);
      if (e2 || !signed) throw new Error("No se pudo generar el enlace.");
      return { url: signed.signedUrl };
    },
  );
}

const RECORD_TABLES = [
  "intake_forms",
  "clinical_histories",
  "psych_tests",
  "consents",
] as const;
type RecordTable = (typeof RECORD_TABLES)[number];

/** Crea un registro clínico nativo en borrador (editable hasta firmar). */
export async function createDraftRecord(
  table: string,
  patientId: string,
  episodeId?: string,
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: CLIN,
      schema: z.object({
        table: z.enum(RECORD_TABLES),
        patient_id: z.string().uuid(),
        episode_id: z
          .string()
          .uuid()
          .optional()
          .or(z.literal("").transform(() => undefined)),
      }),
      input: { table, patient_id: patientId, episode_id: episodeId },
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const base: Record<string, unknown> = {
        tenant_id: ctx.tenantId,
        patient_id: data.patient_id,
        episode_id: data.episode_id ?? null,
        created_by: ctx.userId,
        status: "draft",
      };
      if (data.table === "clinical_histories")
        base.profesional_id = ctx.userId;
      if (data.table === "psych_tests") base.asesor_id = ctx.userId;

      const { data: row, error } = await supabase
        .from(data.table as RecordTable)
        .insert(base as never)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath(`/pacientes/${data.patient_id}`);
      return { id: (row as { id: string }).id };
    },
  );
}

/** Edita un registro clínico (solo mientras está en borrador; trigger lo exige). */
export async function updateClinicalRecord(
  table: string,
  id: string,
  values: Record<string, unknown>,
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: CLIN,
      schema: z.object({
        table: z.enum(RECORD_TABLES),
        id: z.string().uuid(),
        values: z.record(z.string(), z.unknown()),
      }),
      input: { table, id, values },
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from(data.table as RecordTable)
        .update(data.values as never)
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId);
      if (error)
        throw new Error(
          error.message.includes("inmutable")
            ? "El registro ya está firmado/cerrado: usá addenda."
            : error.message,
        );
      revalidatePath("/pacientes");
      return { id: data.id };
    },
  );
}
