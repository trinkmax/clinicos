import type { Metadata } from "next";

import { requireRole } from "@/lib/auth/session";
import { ROLES, hasAnyRole } from "@/lib/auth/roles";
import { getClinicalRecords } from "@/lib/data/clinical";
import { Card } from "@/components/ui/card";
import {
  HceManager,
  type HceRecords,
} from "@/components/clinical/hce-manager";

export const metadata: Metadata = { title: "Historia clínica" };

export default async function PatientHcePage({
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
  const canSign = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.profesional,
  ]);

  if (!canClinical) {
    return (
      <Card className="text-muted-foreground p-6 text-sm">
        Tu rol no tiene acceso a la Historia Clínica.
      </Card>
    );
  }

  const records = await getClinicalRecords(id);

  return (
    <section className="space-y-5">
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
    </section>
  );
}
