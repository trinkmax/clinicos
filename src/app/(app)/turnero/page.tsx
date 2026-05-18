import type { Metadata } from "next";

import { requireRole } from "@/lib/auth/session";
import { ROLES, hasAnyRole } from "@/lib/auth/roles";
import {
  listAppointmentsByDate,
  appointmentDayStats,
  listProfessionals,
} from "@/lib/data/appointments";
import { TurneroBoard } from "@/components/turnero/turnero-board";

export const metadata: Metadata = { title: "Turnero" };

function todayAR(): string {
  // en-CA → YYYY-MM-DD, en huso horario de Argentina
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

export default async function TurneroPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const ctx = await requireRole([
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
    ROLES.asesor,
    ROLES.comercial,
  ]);
  const { date } = await searchParams;
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? date! : todayAR();

  const [appointments, stats, professionals] = await Promise.all([
    listAppointmentsByDate(fecha),
    appointmentDayStats(fecha),
    listProfessionals(),
  ]);

  const canEdit = hasAnyRole(ctx.role, [
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
  ]);

  return (
    <TurneroBoard
      fecha={fecha}
      appointments={appointments}
      stats={stats}
      professionals={professionals}
      canEdit={canEdit}
    />
  );
}
