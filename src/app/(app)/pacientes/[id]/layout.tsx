import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES, hasAnyRole } from "@/lib/auth/roles";
import { getPatient } from "@/lib/data/patients";
import { patientAge } from "@/lib/validation/patients";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  RouteTabs,
  type RouteTabsItem,
} from "@/components/ui/route-tabs";
import { DocumentUpload } from "@/components/patients/document-upload";
import { PATIENT_STATUS_STYLE } from "@/lib/ui/status";
import { cn } from "@/lib/utils";

export default async function PatientLayout({
  children,
  params,
}: {
  children: ReactNode;
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
  const patient = await getPatient(id);
  if (!patient) notFound();

  const age = patientAge(patient.fecha_nacimiento);
  const canClinical = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.profesional,
    ROLES.asesor,
  ]);
  const canCommercial = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.comercial,
  ]);
  const canUpload = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
    ROLES.asesor,
  ]);

  const tabs: RouteTabsItem[] = [
    { id: "resumen", href: `/pacientes/${id}`, label: "Resumen", exact: true },
    ...(canClinical
      ? [
          {
            id: "hce",
            href: `/pacientes/${id}/hce`,
            label: "Historia clínica",
          },
          {
            id: "notas",
            href: `/pacientes/${id}/notas`,
            label: "Notas",
          },
        ]
      : []),
    {
      id: "documentos",
      href: `/pacientes/${id}/documentos`,
      label: "Documentos",
    },
    {
      id: "turnos",
      href: `/pacientes/${id}/turnos`,
      label: "Turnos",
    },
    ...(canCommercial
      ? [
          {
            id: "comercial",
            href: `/pacientes/${id}/comercial`,
            label: "Comercial",
          },
        ]
      : []),
  ];

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
            <Badge
              variant="outline"
              className={cn(
                PATIENT_STATUS_STYLE[
                  patient.status as keyof typeof PATIENT_STATUS_STYLE
                ] ?? "",
              )}
            >
              {patient.status.replace("_", " ")}
            </Badge>
            {canUpload && <DocumentUpload patientId={patient.id} />}
          </div>
        </div>
      </Card>

      <RouteTabs items={tabs} />

      <section className="pt-1">{children}</section>
    </div>
  );
}
