import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES, hasAnyRole } from "@/lib/auth/roles";
import { getPatientDocuments, getPatient } from "@/lib/data/patients";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentUpload } from "@/components/patients/document-upload";
import { DocumentReview } from "@/components/patients/document-review";

const DOC_LABEL: Record<string, string> = {
  ficha_ingreso: "Ficha de Ingreso",
  test_psicologico: "Test Psicológico",
  historia_clinica: "Historia Clínica",
  consentimiento: "Consentimiento",
  datos_comerciales: "Datos Comerciales",
  receta: "Receta",
  comprobante_pago: "Comprobante",
  estudio: "Estudio",
  otro: "Documento",
};

const PIPE_STEPS = ["Subido", "Digitalizado IA", "En revisión", "Validado"];
function stepIndex(status: string): number {
  switch (status) {
    case "uploaded":
      return 0;
    case "extracting":
      return 1;
    case "extracted":
    case "in_review":
      return 2;
    case "validated":
    case "archived":
      return 3;
    default:
      return -1;
  }
}

function StatusTimeline({ status }: { status: string }) {
  const cur = stepIndex(status);
  if (cur === -1) {
    return (
      <span className="text-destructive inline-flex items-center gap-1.5 text-xs font-medium">
        <span className="bg-destructive size-1.5 rounded-full" />
        Extracción fallida
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      {PIPE_STEPS.map((label, i) => {
        const done = i < cur;
        const active = i === cur;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className={`size-1.5 rounded-full ${
                done
                  ? "bg-success"
                  : active
                    ? "bg-primary animate-pulse-ring"
                    : "bg-muted-foreground/30"
              }`}
            />
            <span
              className={`text-[11px] ${
                done || active
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < PIPE_STEPS.length - 1 && (
              <span
                className={`h-px w-5 ${done ? "bg-success" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export const metadata: Metadata = { title: "Documentos" };

export default async function PatientDocumentosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireRole([
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
    ROLES.asesor,
    ROLES.comercial,
  ]);
  const { id } = await params;
  const canUpload = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
    ROLES.asesor,
  ]);
  const canClinical = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.profesional,
    ROLES.asesor,
  ]);

  const [documents, patient] = await Promise.all([
    getPatientDocuments(id),
    getPatient(id),
  ]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="text-muted-foreground size-4" />
          Documentos digitalizados ({documents.length})
        </h2>
        {canUpload && patient && <DocumentUpload patientId={patient.id} />}
      </div>
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin documentos todavía"
          description="Escaneá la Ficha de Ingreso, el Test, la Historia Clínica o el Consentimiento. La IA los digitaliza y después validás los datos contra el papel."
          action={
            canUpload && patient ? (
              <DocumentUpload patientId={patient.id} />
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3">
          {documents.map((doc) => {
            const ext = Array.isArray(doc.document_extractions)
              ? doc.document_extractions[0]
              : null;
            const conf =
              ext?.confidence != null
                ? Math.round(Number(ext.confidence) * 100)
                : null;
            const reviewable =
              ext &&
              (ext.status === "in_review" || ext.status === "validated");
            return (
              <Card key={doc.id} className="hairline-top p-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                  <div className="bg-primary/10 text-primary ring-primary/10 grid size-10 place-items-center rounded-xl ring-1">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold tracking-tight">
                      {DOC_LABEL[doc.doc_type] ?? doc.doc_type}
                    </p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {new Date(doc.created_at).toLocaleString("es-AR")}
                      {conf != null && ` · IA ${conf}%`}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <StatusTimeline status={doc.status} />
                  </div>
                  {reviewable && ext ? (
                    <DocumentReview
                      extractionId={ext.id}
                      documentId={doc.id}
                      patientId={id}
                      docLabel={DOC_LABEL[doc.doc_type] ?? doc.doc_type}
                      data={ext.data as Record<string, unknown>}
                      mime={doc.mime}
                      confidence={
                        ext.confidence != null ? Number(ext.confidence) : 0.5
                      }
                      status={ext.status}
                      canEdit={canClinical}
                      canPromote={canClinical}
                    />
                  ) : doc.status !== "failed" ? (
                    <span className="text-muted-foreground text-xs">
                      Procesando…
                    </span>
                  ) : null}
                </div>
                <div className="px-5 pb-3 sm:hidden">
                  <StatusTimeline status={doc.status} />
                </div>
                {ext?.status === "failed" && (
                  <p className="border-destructive/20 bg-destructive/5 text-destructive border-t px-5 py-3 text-xs">
                    Extracción IA fallida: {ext.error ?? "error desconocido"}.
                    Verificá ANTHROPIC_API_KEY o reintentá la subida.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
