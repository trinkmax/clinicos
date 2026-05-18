"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  FilePlus2,
  Pencil,
  ChevronDown,
  Stethoscope,
  ClipboardList,
  Brain,
  FileSignature,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { createDraftRecord } from "@/lib/actions/clinical";
import { CLINICAL_FORMS } from "@/config/clinical-forms";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RecordTree } from "@/components/clinical/structured-record";
import { ClinicalFormEditor } from "@/components/clinical/clinical-form-editor";
import { SignHistoryButton } from "@/components/clinical/clinical-actions";

type Rec = Record<string, unknown> & { id: string; status: string };

const GROUPS: {
  formKey: string;
  rows: keyof HceRecords;
  icon: LucideIcon;
}[] = [
  { formKey: "historia_clinica", rows: "history", icon: Stethoscope },
  { formKey: "ficha_ingreso", rows: "intake", icon: ClipboardList },
  { formKey: "test_psicologico", rows: "psych", icon: Brain },
  { formKey: "consentimiento", rows: "consents", icon: FileSignature },
];

export interface HceRecords {
  history: Rec[];
  intake: Rec[];
  psych: Rec[];
  consents: Rec[];
}

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  signed: "bg-success/12 text-success",
  closed: "bg-info/12 text-info",
  amended: "bg-warning/15 text-warning-foreground",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  signed: "Firmada",
  closed: "Cerrada",
  amended: "Con addenda",
};

const HIDDEN_KEYS = [
  "id",
  "tenant_id",
  "patient_id",
  "episode_id",
  "document_id",
  "created_by",
  "created_at",
  "updated_at",
  "status",
  "profesional_id",
  "asesor_id",
  "signed_by",
  "signed_at",
];

export function HceManager({
  records,
  patientId,
  canEdit,
  canSign,
}: {
  records: HceRecords;
  patientId: string;
  canEdit: boolean;
  canSign: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [openEditor, setOpenEditor] = useState<string | null>(null);

  function create(formKey: string) {
    start(async () => {
      const r = await createDraftRecord(formKey, patientId);
      if (r.ok) {
        toast.success("Borrador creado — completalo y guardá");
        setOpenEditor(r.data.id);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Lock className="size-3.5" />
          Registro append-only · las correcciones se hacen por addenda (Ley
          26.529)
        </p>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={pending}
              render={
                <Button size="sm">
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FilePlus2 className="size-4" />
                  )}
                  Nuevo registro
                  <ChevronDown className="size-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {GROUPS.map((g) => (
                <DropdownMenuItem
                  key={g.formKey}
                  onSelect={() => create(g.formKey)}
                >
                  <g.icon className="size-4" />
                  {CLINICAL_FORMS[g.formKey].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {GROUPS.map((g) => {
        const rows = records[g.rows];
        return (
          <section key={g.formKey} className="space-y-2.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <span className="bg-primary/10 text-primary grid size-7 place-items-center rounded-lg">
                <g.icon className="size-4" />
              </span>
              {CLINICAL_FORMS[g.formKey].label}
              <span className="text-muted-foreground text-xs font-normal">
                ({rows.length})
              </span>
            </h3>
            {rows.length === 0 ? (
              <EmptyState
                icon={g.icon}
                title="Sin registros"
                description={
                  canEdit
                    ? "Creá uno desde «Nuevo registro» o promové una extracción validada de un escaneo."
                    : "Todavía no hay registros de este tipo."
                }
                className="py-10"
              />
            ) : (
              <div className="space-y-2.5">
                {rows.map((rec) => {
                  const isDraft = rec.status === "draft";
                  const editing = openEditor === rec.id;
                  const created =
                    typeof rec.created_at === "string"
                      ? new Date(rec.created_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : null;
                  return (
                    <Card
                      key={rec.id}
                      className="hairline-top gap-0 overflow-hidden p-0"
                    >
                      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                              STATUS_STYLE[rec.status] ??
                                "bg-muted text-muted-foreground",
                            )}
                          >
                            {STATUS_LABEL[rec.status] ?? rec.status}
                          </span>
                          {created && (
                            <span className="text-muted-foreground text-xs tabular-nums">
                              {created}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isDraft && canEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setOpenEditor(editing ? null : rec.id)
                              }
                            >
                              {editing ? (
                                <ChevronDown className="size-3.5" />
                              ) : (
                                <Pencil className="size-3.5" />
                              )}
                              {editing ? "Cerrar" : "Editar"}
                            </Button>
                          )}
                          {g.formKey === "historia_clinica" &&
                            isDraft &&
                            canSign && (
                              <SignHistoryButton historyId={rec.id} />
                            )}
                        </div>
                      </div>
                      <div className="border-t px-5 py-4">
                        {editing ? (
                          <ClinicalFormEditor
                            formKey={g.formKey}
                            record={rec}
                          />
                        ) : (
                          <RecordTree
                            data={Object.fromEntries(
                              Object.entries(rec).filter(
                                ([k]) => !HIDDEN_KEYS.includes(k),
                              ),
                            )}
                          />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
