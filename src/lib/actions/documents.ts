"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/auth/roles";
import { action, type ActionResult } from "@/lib/actions/result";
import { extractDocument } from "@/lib/ai/extraction";
import type { Database, Json } from "@/lib/db/database.types";

type DocType = Database["public"]["Enums"]["doc_type"];

const UPLOAD_ROLES = [
  ROLES.owner,
  ROLES.admin,
  ROLES.recepcion,
  ROLES.profesional,
  ROLES.asesor,
] as const;

const uploadSchema = z.object({
  docType: z.enum([
    "ficha_ingreso",
    "test_psicologico",
    "historia_clinica",
    "consentimiento",
    "datos_comerciales",
    "receta",
    "comprobante_pago",
    "estudio",
    "otro",
  ]),
  patientId: z.string().uuid().optional(),
  episodeId: z.string().uuid().optional(),
});

/**
 * Sube un documento escaneado (inmutable) y dispara la extracción IA.
 * La revisión humana valida los datos luego (pantalla de revisión).
 */
export async function uploadDocument(
  formData: FormData,
): Promise<ActionResult<{ documentId: string; extracted: boolean }>> {
  const file = formData.get("file");
  return action(
    {
      roles: UPLOAD_ROLES,
      schema: uploadSchema,
      input: {
        docType: formData.get("docType"),
        patientId: formData.get("patientId") || undefined,
        episodeId: formData.get("episodeId") || undefined,
      },
    },
    async (data, ctx) => {
      if (!(file instanceof File) || file.size === 0)
        throw new Error("Adjuntá un archivo (PDF o imagen del escaneo).");
      if (file.size > 31_457_280)
        throw new Error("El archivo supera el máximo de 30 MB.");

      const buffer = Buffer.from(await file.arrayBuffer());
      const sha256 = createHash("sha256").update(buffer).digest("hex");
      const documentId = randomUUID();
      const safeName = file.name.replace(/[^\w.\-]/g, "_").slice(-80);
      const folder = data.patientId ?? "inbox";
      const path = `${ctx.tenantId}/${folder}/${documentId}/${safeName}`;

      const supabase = await createClient();
      const { error: upErr } = await supabase.storage
        .from("patient-documents")
        .upload(path, buffer, { contentType: file.type, upsert: false });
      if (upErr) throw new Error(`Subida fallida: ${upErr.message}`);

      const { error: docErr } = await supabase
        .from("patient_documents")
        .insert({
          id: documentId,
          tenant_id: ctx.tenantId,
          patient_id: data.patientId ?? null,
          episode_id: data.episodeId ?? null,
          doc_type: data.docType as DocType,
          storage_path: path,
          sha256,
          mime: file.type || "application/octet-stream",
          bytes: file.size,
          status: "extracting",
          uploaded_by: ctx.userId,
        });
      if (docErr) throw new Error(docErr.message);

      // Extracción IA (humano en el loop valida después).
      let extracted = false;
      try {
        const res = await extractDocument({
          docType: data.docType as DocType,
          base64: buffer.toString("base64"),
          mime: file.type || "application/pdf",
        });
        await supabase.from("document_extractions").insert({
          tenant_id: ctx.tenantId,
          document_id: documentId,
          doc_type: data.docType as DocType,
          model: res.model,
          prompt_version: res.promptVersion,
          data: res.data as unknown as Json,
          confidence: res.confidence,
          field_meta: { uncertain_fields: res.uncertainFields },
          status: "in_review",
        });
        await supabase
          .from("patient_documents")
          .update({ status: "in_review" })
          .eq("id", documentId);
        extracted = true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error de extracción";
        await supabase.from("document_extractions").insert({
          tenant_id: ctx.tenantId,
          document_id: documentId,
          doc_type: data.docType as DocType,
          data: {},
          status: "failed",
          error: msg,
        });
        await supabase
          .from("patient_documents")
          .update({ status: "failed" })
          .eq("id", documentId);
      }

      if (data.patientId) revalidatePath(`/pacientes/${data.patientId}`);
      revalidatePath("/pacientes");
      return { documentId, extracted };
    },
  );
}

/** Valida (humano en el loop) la extracción: marca validada + corrige datos. */
export async function validateExtraction(
  extractionId: string,
  correctedData: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: [ROLES.owner, ROLES.admin, ROLES.profesional, ROLES.asesor],
      schema: z.object({
        extractionId: z.string().uuid(),
        data: z.record(z.string(), z.unknown()),
      }),
      input: { extractionId, data: correctedData },
    },
    async (input, ctx) => {
      const supabase = await createClient();
      const { data: ext, error } = await supabase
        .from("document_extractions")
        .update({
          data: input.data as unknown as Json,
          status: "validated",
          validated_by: ctx.userId,
          validated_at: new Date().toISOString(),
        })
        .eq("id", input.extractionId)
        .eq("tenant_id", ctx.tenantId)
        .select("document_id")
        .single();
      if (error) throw new Error(error.message);
      await supabase
        .from("patient_documents")
        .update({ status: "validated" })
        .eq("id", ext.document_id);
      revalidatePath("/pacientes");
      return { id: input.extractionId };
    },
  );
}
