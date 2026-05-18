"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FilePlus2, Pencil, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { createDraftRecord } from "@/lib/actions/clinical";
import { CLINICAL_FORMS } from "@/config/clinical-forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const GROUPS: { formKey: string; rows: keyof HceRecords }[] = [
  { formKey: "historia_clinica", rows: "history" },
  { formKey: "ficha_ingreso", rows: "intake" },
  { formKey: "test_psicologico", rows: "psych" },
  { formKey: "consentimiento", rows: "consents" },
];

export interface HceRecords {
  history: Rec[];
  intake: Rec[];
  psych: Rec[];
  consents: Rec[];
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  signed: "Firmada",
  closed: "Cerrada",
  amended: "Con addenda",
};

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
      {canEdit && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={pending}
              className="bg-primary text-primary-foreground inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FilePlus2 className="size-4" />
              )}
              Nuevo registro
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {GROUPS.map((g) => (
                <DropdownMenuItem
                  key={g.formKey}
                  onSelect={() => create(g.formKey)}
                >
                  {CLINICAL_FORMS[g.formKey].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {GROUPS.map((g) => {
        const rows = records[g.rows];
        return (
          <div key={g.formKey} className="space-y-2">
            <h3 className="text-sm font-semibold">
              {CLINICAL_FORMS[g.formKey].label}
            </h3>
            {rows.length === 0 ? (
              <Card className="text-muted-foreground p-5 text-center text-sm">
                Sin registros.
              </Card>
            ) : (
              rows.map((rec) => {
                const isDraft = rec.status === "draft";
                const editing = openEditor === rec.id;
                return (
                  <Card key={rec.id} className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={
                          rec.status !== "draft"
                            ? "bg-success/12 text-success border-success/20"
                            : ""
                        }
                      >
                        {STATUS_LABEL[rec.status] ?? rec.status}
                      </Badge>
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
                    {editing ? (
                      <ClinicalFormEditor
                        formKey={g.formKey}
                        record={rec}
                      />
                    ) : (
                      <RecordTree
                        data={Object.fromEntries(
                          Object.entries(rec).filter(
                            ([k]) =>
                              ![
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
                              ].includes(k),
                          ),
                        )}
                      />
                    )}
                  </Card>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
