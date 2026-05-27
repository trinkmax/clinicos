import type { Metadata } from "next";
import { CalendarClock, MapPin, Video } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { TIPO_STYLE, ESTADO_STYLE } from "@/lib/ui/appointments";
import { TIPO_LABEL, ESTADO_LABEL } from "@/lib/validation/appointments";

export const metadata: Metadata = { title: "Turnos · paciente" };

export default async function PatientTurnosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole([
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
    ROLES.asesor,
    ROLES.comercial,
  ]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: appts } = await supabase
    .from("appointments")
    .select(
      "id, fecha, hora, duracion_min, tipo, estado, modalidad, abono, virtual_flexible",
    )
    .eq("patient_id", id)
    .order("fecha", { ascending: false })
    .order("hora", { ascending: false })
    .limit(200);

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <CalendarClock className="text-muted-foreground size-4" />
        Historial de turnos ({appts?.length ?? 0})
      </h2>
      {!appts || appts.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Sin turnos registrados"
          description="Cuando se agende uno desde el Turnero, aparecerá acá con su estado."
        />
      ) : (
        <Card className="p-0">
          <ul className="divide-y">
            {appts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5"
              >
                <div className="w-24 shrink-0 text-sm font-medium tabular-nums">
                  {a.fecha}
                  <span className="text-muted-foreground ml-2 text-xs">
                    {a.hora.slice(0, 5)}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  {a.modalidad === "videollamada" ? (
                    <Video className="size-3" />
                  ) : (
                    <MapPin className="size-3" />
                  )}
                  <span className="capitalize">{a.modalidad}</span>
                  {a.virtual_flexible && " · flexible"}
                </div>
                <span className="ml-auto" />
                <Badge
                  variant="outline"
                  className={cn(TIPO_STYLE[a.tipo as keyof typeof TIPO_STYLE])}
                >
                  {TIPO_LABEL[a.tipo as keyof typeof TIPO_LABEL] ?? a.tipo}
                </Badge>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-medium",
                    ESTADO_STYLE[a.estado as keyof typeof ESTADO_STYLE],
                  )}
                >
                  {ESTADO_LABEL[a.estado as keyof typeof ESTADO_LABEL] ??
                    a.estado}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
