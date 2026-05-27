import type { Metadata } from "next";
import Link from "next/link";
import { Users, ChevronRight, Stethoscope } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listPatients, patientCounters } from "@/lib/data/patients";
import { patientAge } from "@/lib/validation/patients";
import { PatientSearch } from "@/components/patients/patient-search";
import { NewPatientDialog } from "@/components/patients/new-patient-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PATIENT_STATUS_STYLE } from "@/lib/ui/status";

export const metadata: Metadata = { title: "Pacientes" };

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const ctx = await requireRole([
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
    ROLES.asesor,
    ROLES.comercial,
  ]);
  const { q } = await searchParams;
  const [patients, counters] = await Promise.all([
    listPatients({ q }),
    patientCounters(),
  ]);
  const canCreate = ["owner", "admin", "recepcion", "profesional"].includes(
    ctx.role,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow={
          <>
            <Stethoscope className="size-3" />
            Historia clínica electrónica
          </>
        }
        title="Pacientes"
        description={`${counters.total} pacientes · ${counters.enTratamiento} en tratamiento`}
        size="lg"
        actions={canCreate ? <NewPatientDialog /> : undefined}
      />

      <div className="flex flex-wrap items-center gap-3">
        <PatientSearch />
      </div>

      <Card className="overflow-hidden p-0">
        {patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={q ? "Sin resultados" : "Sin pacientes"}
            description={
              q
                ? "No encontramos pacientes para esa búsqueda. Probá con otro nombre, DNI o teléfono."
                : "Creá el primer paciente o digitalizá una Ficha de Ingreso para empezar."
            }
            action={canCreate ? <NewPatientDialog /> : undefined}
          />
        ) : (
          <ul className="divide-y">
            {patients.map((p) => {
              const age = patientAge(p.fecha_nacimiento);
              return (
                <li key={p.id}>
                  <Link
                    href={`/pacientes/${p.id}`}
                    className="hover:bg-accent/40 flex items-center gap-4 px-5 py-3.5 transition-colors"
                  >
                    <div className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold">
                      {p.apellido.slice(0, 1)}
                      {p.nombres.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {p.apellido}, {p.nombres}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {p.dni ? `DNI ${p.dni}` : "Sin DNI"}
                        {age != null && ` · ${age} años`}
                        {p.telefono && ` · ${p.telefono}`}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        PATIENT_STATUS_STYLE[
                          p.status as keyof typeof PATIENT_STATUS_STYLE
                        ] ?? ""
                      }
                    >
                      {p.status.replace("_", " ")}
                    </Badge>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
