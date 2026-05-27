import type { Metadata } from "next";

import { requireRole } from "@/lib/auth/session";
import { ROLES, hasAnyRole } from "@/lib/auth/roles";
import { getClinicalRecords } from "@/lib/data/clinical";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddNoteForm } from "@/components/clinical/clinical-actions";

export const metadata: Metadata = { title: "Notas clínicas" };

export default async function PatientNotasPage({
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

  if (!canClinical) {
    return (
      <Card className="text-muted-foreground p-6 text-sm">
        Tu rol no tiene acceso a las notas clínicas.
      </Card>
    );
  }

  const records = await getClinicalRecords(id);

  return (
    <section className="space-y-4">
      <Card className="p-4">
        <AddNoteForm patientId={id} />
      </Card>
      {records.notes.length === 0 ? (
        <Card className="text-muted-foreground p-8 text-center text-sm">
          Sin notas todavía. Las notas son append-only (Ley 26.529): para
          corregir, agregá un addendum en una nueva nota.
        </Card>
      ) : (
        <div className="space-y-2">
          {records.notes.map((n) => (
            <Card key={n.id} className="p-4">
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                <Badge variant="secondary">{n.tipo.replace("_", " ")}</Badge>
                {n.fecha}
              </div>
              <p className="text-sm whitespace-pre-wrap">{n.contenido}</p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
