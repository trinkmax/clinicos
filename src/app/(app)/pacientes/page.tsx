import type { Metadata } from "next";
import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listPatients, patientCounters } from "@/lib/data/patients";
import { patientAge } from "@/lib/validation/patients";
import { PatientSearch } from "@/components/patients/patient-search";
import { NewPatientDialog } from "@/components/patients/new-patient-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Pacientes" };

const STATUS_STYLE: Record<string, string> = {
  activo: "bg-info/12 text-info border-info/20",
  en_tratamiento: "bg-success/12 text-success border-success/20",
  alta: "bg-muted text-muted-foreground",
  inactivo: "bg-muted text-muted-foreground",
};

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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Historia Clínica Electrónica · {counters.total} pacientes ·{" "}
            {counters.enTratamiento} en tratamiento
          </p>
        </div>
        {canCreate && <NewPatientDialog />}
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <PatientSearch />
      </div>

      <Card className="overflow-hidden p-0">
        {patients.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Users className="text-muted-foreground size-8" />
            <p className="font-medium">Sin pacientes</p>
            <p className="text-muted-foreground text-sm">
              {q
                ? "No hay resultados para esa búsqueda."
                : "Creá el primer paciente o digitalizá una Ficha de Ingreso."}
            </p>
          </div>
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
                      className={STATUS_STYLE[p.status] ?? ""}
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
