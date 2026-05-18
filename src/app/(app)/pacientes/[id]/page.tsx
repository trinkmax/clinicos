import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck, Stethoscope } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES, hasAnyRole } from "@/lib/auth/roles";
import { getPatient, getPatientDocuments } from "@/lib/data/patients";
import { listEpisodes, getClinicalRecords } from "@/lib/data/clinical";
import { patientAge } from "@/lib/validation/patients";
import { CONDICION_LABEL } from "@/lib/validation/clinical";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentUpload } from "@/components/patients/document-upload";
import { DocumentReview } from "@/components/patients/document-review";
import { EmptyState } from "@/components/ui/empty-state";
import {
  HceManager,
  type HceRecords,
} from "@/components/clinical/hce-manager";
import {
  NewEpisodeDialog,
  EpisodeStatusMenu,
  AddNoteForm,
} from "@/components/clinical/clinical-actions";

export const metadata: Metadata = { title: "Paciente" };

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
const DOC_STATUS: Record<string, string> = {
  uploaded: "bg-muted text-muted-foreground",
  extracting: "bg-info/12 text-info border-info/20",
  in_review: "bg-warning/15 text-warning-foreground border-warning/30",
  validated: "bg-success/12 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};
const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "hce", label: "Historia Clínica" },
  { id: "documentos", label: "Documentos" },
  { id: "notas", label: "Notas" },
] as const;

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
      return -1; // failed
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


export default async function PatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
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
  const { tab: tabParam } = await searchParams;
  const tab = TABS.find((t) => t.id === tabParam)?.id ?? "resumen";

  const patient = await getPatient(id);
  if (!patient) notFound();

  const age = patientAge(patient.fecha_nacimiento);
  const canClinical = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.profesional,
    ROLES.asesor,
  ]);
  const canSign = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.profesional,
  ]);
  const canUpload = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
    ROLES.asesor,
  ]);

  const [documents, episodes, records] = await Promise.all([
    getPatientDocuments(id),
    canClinical ? listEpisodes(id) : Promise.resolve([]),
    canClinical
      ? getClinicalRecords(id)
      : Promise.resolve({
          intake: [],
          psych: [],
          history: [],
          consents: [],
          notes: [],
        }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/pacientes"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Pacientes
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary grid size-14 place-items-center rounded-2xl text-lg font-semibold">
              {patient.apellido.slice(0, 1)}
              {patient.nombres.slice(0, 1)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {patient.apellido}, {patient.nombres}
              </h1>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {patient.dni ? `DNI ${patient.dni}` : "Sin DNI"}
                {age != null && ` · ${age} años`}
                {patient.telefono && ` · ${patient.telefono}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {patient.status.replace("_", " ")}
            </Badge>
            {canUpload && <DocumentUpload patientId={patient.id} />}
          </div>
        </div>
      </Card>

      <nav className="flex gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/pacientes/${id}?tab=${t.id}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "resumen" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Stethoscope className="text-muted-foreground size-4" />
              Episodios clínicos
            </h2>
            {canClinical && <NewEpisodeDialog patientId={id} />}
          </div>
          {!canClinical ? (
            <Card className="text-muted-foreground p-6 text-sm">
              Tu rol no tiene acceso al detalle clínico.
            </Card>
          ) : episodes.length === 0 ? (
            <Card className="text-muted-foreground p-8 text-center text-sm">
              Sin episodios. Creá uno para iniciar el recorrido clínico.
            </Card>
          ) : (
            <div className="space-y-2">
              {episodes.map((e) => (
                <Card
                  key={e.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {e.condiciones.length
                        ? e.condiciones
                            .map(
                              (c) =>
                                CONDICION_LABEL[
                                  c as keyof typeof CONDICION_LABEL
                                ],
                            )
                            .join(" · ")
                        : "Episodio"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Abierto {new Date(e.opened_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <EpisodeStatusMenu id={e.id} status={e.status} />
                </Card>
              ))}
            </div>
          )}
          <Card className="bg-muted/30 grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
            {[
              ["Documentos", documents.length],
              ["HC", records.history.length],
              ["Fichas", records.intake.length],
              ["Notas", records.notes.length],
            ].map(([l, n]) => (
              <div key={l as string}>
                <p className="text-2xl font-semibold tabular-nums">
                  {n as number}
                </p>
                <p className="text-muted-foreground text-xs">{l as string}</p>
              </div>
            ))}
          </Card>
        </section>
      )}

      {tab === "hce" && (
        <section className="space-y-5">
          {!canClinical ? (
            <Card className="text-muted-foreground p-6 text-sm">
              Tu rol no tiene acceso a la Historia Clínica.
            </Card>
          ) : (
            <HceManager
              records={
                {
                  history: records.history,
                  intake: records.intake,
                  psych: records.psych,
                  consents: records.consents,
                } as unknown as HceRecords
              }
              patientId={id}
              canEdit={canClinical}
              canSign={canSign}
            />
          )}
        </section>
      )}

      {tab === "documentos" && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="text-muted-foreground size-4" />
            Documentos digitalizados ({documents.length})
          </h2>
          {documents.length === 0 ? (
            <Card className="text-muted-foreground p-10 text-center text-sm">
              Sin documentos. Escaneá la Ficha / Test / HC / Consentimiento —
              la IA los digitaliza y luego validás los datos.
            </Card>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const ext = Array.isArray(doc.document_extractions)
                  ? doc.document_extractions[0]
                  : null;
                return (
                  <Card key={doc.id} className="overflow-hidden p-0">
                    <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                      <div className="bg-muted grid size-9 place-items-center rounded-lg">
                        <FileText className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {DOC_LABEL[doc.doc_type] ?? doc.doc_type}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(doc.created_at).toLocaleString("es-AR")}
                          {ext?.confidence != null &&
                            ` · IA ${Math.round(Number(ext.confidence) * 100)}%`}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={DOC_STATUS[doc.status] ?? ""}
                      >
                        {doc.status === "validated" && (
                          <ShieldCheck className="size-3" />
                        )}
                        {doc.status.replace("_", " ")}
                      </Badge>
                      <DocumentViewerButton documentId={doc.id} />
                      {ext?.status === "validated" && canClinical && (
                        <PromoteExtractionButton
                          extractionId={ext.id}
                          patientId={id}
                        />
                      )}
                    </div>
                    {ext &&
                      (ext.status === "in_review" ||
                        ext.status === "validated") && (
                        <ExtractionReview
                          extractionId={ext.id}
                          docType={doc.doc_type}
                          data={ext.data as Record<string, unknown>}
                          readOnly={!canClinical || ext.status === "validated"}
                          validated={ext.status === "validated"}
                        />
                      )}
                    {ext?.status === "failed" && (
                      <p className="border-destructive/20 bg-destructive/5 text-destructive border-t px-5 py-3 text-xs">
                        Extracción IA fallida:{" "}
                        {ext.error ?? "error desconocido"}. Verificá
                        ANTHROPIC_API_KEY.
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "notas" && (
        <section className="space-y-4">
          {!canClinical ? (
            <Card className="text-muted-foreground p-6 text-sm">
              Tu rol no tiene acceso a las notas clínicas.
            </Card>
          ) : (
            <>
              <Card className="p-4">
                <AddNoteForm patientId={id} />
              </Card>
              {records.notes.length === 0 ? (
                <Card className="text-muted-foreground p-8 text-center text-sm">
                  Sin notas todavía.
                </Card>
              ) : (
                <div className="space-y-2">
                  {records.notes.map((n) => (
                    <Card key={n.id} className="p-4">
                      <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                        <Badge variant="secondary">
                          {n.tipo.replace("_", " ")}
                        </Badge>
                        {n.fecha}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {n.contenido}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

