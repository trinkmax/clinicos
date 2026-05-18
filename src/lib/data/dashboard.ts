import "server-only";

import { ROLES, type Role } from "@/lib/auth/roles";
import { patientCounters } from "@/lib/data/patients";
import {
  listAppointmentsByDate,
  appointmentDayStats,
  type AppointmentWithPatient,
} from "@/lib/data/appointments";
import { commercialTotals } from "@/lib/data/commercial";
import { crmStats } from "@/lib/data/crm";
import { operationsTotals } from "@/lib/data/operations";
import {
  patientFunnel,
  revenueByProduct,
  followupsPendientes,
} from "@/lib/data/reports";

const has = (role: Role, set: readonly Role[]) => set.includes(role);

const CLIN: Role[] = [
  ROLES.owner,
  ROLES.admin,
  ROLES.recepcion,
  ROLES.profesional,
  ROLES.asesor,
  ROLES.comercial,
];
const COM: Role[] = [ROLES.owner, ROLES.admin, ROLES.comercial];
const CRM: Role[] = [
  ROLES.owner,
  ROLES.admin,
  ROLES.marketing,
  ROLES.comercial,
  ROLES.recepcion,
];
const REPORT: Role[] = [ROLES.owner, ROLES.admin, ROLES.comercial];

/** Huso horario Argentina → YYYY-MM-DD (igual criterio que el Turnero). */
export function todayAR(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export interface DashboardData {
  fecha: string;
  patients: { total: number; enTratamiento: number } | null;
  appointments: {
    stats: { total: number; atendidos: number; abonaron: number };
    today: AppointmentWithPatient[];
  } | null;
  commercial: { facturado: number; cobrado: number; saldo: number } | null;
  crm: { convAbiertas: number; leads: number } | null;
  ops: {
    seguimientosPendientes: number;
    seguimientosVencidos: number;
    stockBajo: number;
  } | null;
  funnel: { status: string; total: number }[] | null;
  revenue: { producto: string; planes: number; cobrado: number }[] | null;
  followups: { tipo: string; total: number; vencidos: number }[] | null;
}

/** Agrega los indicadores del día visibles para el rol (resiliente a RLS). */
export async function getDashboard(role: Role): Promise<DashboardData> {
  const fecha = todayAR();

  const [
    patients,
    apptStats,
    apptToday,
    commercial,
    crm,
    ops,
    funnel,
    revenue,
    followups,
  ] = await Promise.all([
    has(role, CLIN)
      ? safe(patientCounters(), { total: 0, enTratamiento: 0 })
      : Promise.resolve(null),
    has(role, CLIN)
      ? safe(appointmentDayStats(fecha), {
          total: 0,
          atendidos: 0,
          abonaron: 0,
        })
      : Promise.resolve(null),
    has(role, CLIN)
      ? safe(listAppointmentsByDate(fecha), [] as AppointmentWithPatient[])
      : Promise.resolve(null),
    has(role, COM)
      ? safe(commercialTotals(), {
          planes: 0,
          facturado: 0,
          cobrado: 0,
          saldo: 0,
        })
      : Promise.resolve(null),
    has(role, CRM)
      ? safe(crmStats(), { convAbiertas: 0, leads: 0 })
      : Promise.resolve(null),
    has(role, COM)
      ? safe(operationsTotals(), {
          stockBajo: 0,
          seguimientosPendientes: 0,
          seguimientosVencidos: 0,
        })
      : Promise.resolve(null),
    has(role, REPORT)
      ? safe(patientFunnel(), [] as { status: string; total: number }[])
      : Promise.resolve(null),
    has(role, REPORT)
      ? safe(
          revenueByProduct(),
          [] as { producto: string; planes: number; cobrado: number }[],
        )
      : Promise.resolve(null),
    has(role, REPORT)
      ? safe(
          followupsPendientes(),
          [] as { tipo: string; total: number; vencidos: number }[],
        )
      : Promise.resolve(null),
  ]);

  return {
    fecha,
    patients,
    appointments:
      apptStats && apptToday
        ? { stats: apptStats, today: apptToday }
        : null,
    commercial: commercial
      ? {
          facturado: commercial.facturado,
          cobrado: commercial.cobrado,
          saldo: commercial.saldo,
        }
      : null,
    crm,
    ops,
    funnel,
    revenue: revenue
      ? revenue.map((r) => ({
          producto: r.producto,
          planes: r.planes,
          cobrado: r.cobrado,
        }))
      : null,
    followups,
  };
}
