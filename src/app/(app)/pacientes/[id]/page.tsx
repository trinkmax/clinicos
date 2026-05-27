import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES, hasAnyRole } from "@/lib/auth/roles";
import { listEpisodes, getClinicalRecords } from "@/lib/data/clinical";
import { getPatientDocuments } from "@/lib/data/patients";
import { CONDICION_LABEL } from "@/lib/validation/clinical";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewEpisodeDialog, EpisodeStatusMenu } from "@/components/clinical/clinical-actions";
import { EPISODE_STATUS_STYLE } from "@/lib/ui/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Resumen" };

export default async function PatientSummaryPage({
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

  const canClinical = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Stethoscope className="text-muted-foreground size-4" />
          Episodios clínicos ({episodes.length})
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
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    EPISODE_STATUS_STYLE[
                      e.status as keyof typeof EPISODE_STATUS_STYLE
                    ] ?? "",
                  )}
                >
                  {e.status}
                </Badge>
                <EpisodeStatusMenu id={e.id} status={e.status} />
              </div>
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
  );
}
