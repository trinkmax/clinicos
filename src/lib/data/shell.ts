import "server-only";

import { ROLES, type Role } from "@/lib/auth/roles";
import { appointmentDayStats } from "@/lib/data/appointments";
import { crmStats } from "@/lib/data/crm";
import { operationsTotals } from "@/lib/data/operations";
import { listChannels } from "@/lib/data/channels";
import { todayAR } from "@/lib/data/dashboard";

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

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export interface ShellCounters {
  fecha: string;
  /** Turnos del día (total — abre `/turnero?date=hoy`). */
  turnosHoy: number;
  /** Conversaciones abiertas en el CRM (canal omnicanal). */
  inboxUnread: number;
  /** Seguimientos pendientes vencidos. Alerta operativa principal. */
  seguimientosVencidos: number;
  /** Ítems de stock por debajo del mínimo. */
  stockBajo: number;
  /** Cantidad de planes con saldo + días en mora. */
  cobranzasPendientes: number;
  /** Estado consolidado de canales (peor estado gana). */
  channels: {
    whatsapp: "connected" | "disconnected" | "pending" | "error" | "none";
    meta: "connected" | "disconnected" | "pending" | "error" | "none";
  };
}

/**
 * Cargas para la shell (sidebar + topbar). Una sola llamada por request,
 * resiliente: si una query falla (RLS), su sección queda en 0.
 */
export async function getShellCounters(role: Role): Promise<ShellCounters> {
  const fecha = todayAR();

  const [appt, crm, ops, channels] = await Promise.all([
    CLIN.includes(role)
      ? safe(appointmentDayStats(fecha), {
          total: 0,
          atendidos: 0,
          abonaron: 0,
        })
      : Promise.resolve({ total: 0, atendidos: 0, abonaron: 0 }),
    CRM.includes(role)
      ? safe(crmStats(), { convAbiertas: 0, leads: 0 })
      : Promise.resolve({ convAbiertas: 0, leads: 0 }),
    COM.includes(role)
      ? safe(operationsTotals(), {
          stockBajo: 0,
          seguimientosPendientes: 0,
          seguimientosVencidos: 0,
        })
      : Promise.resolve({
          stockBajo: 0,
          seguimientosPendientes: 0,
          seguimientosVencidos: 0,
        }),
    safe(listChannels(), []),
  ]);

  function pickStatus(
    tipo: "whatsapp" | "meta",
  ): ShellCounters["channels"]["whatsapp"] {
    const matches = channels.filter((c) =>
      tipo === "whatsapp"
        ? c.tipo.startsWith("whatsapp")
        : c.tipo.includes("meta") || c.tipo.includes("facebook"),
    );
    if (matches.length === 0) return "none";
    const states = matches.map((c) => c.estado);
    if (states.some((s) => s === "error")) return "error";
    if (states.some((s) => s === "disconnected")) return "disconnected";
    if (states.some((s) => s === "pending" || s === "qr")) return "pending";
    if (states.some((s) => s === "connected" || s === "active"))
      return "connected";
    return "disconnected";
  }

  return {
    fecha,
    turnosHoy: appt.total,
    inboxUnread: crm.convAbiertas,
    seguimientosVencidos: ops.seguimientosVencidos,
    stockBajo: ops.stockBajo,
    cobranzasPendientes: 0, // se completa cuando finance se cachee
    channels: {
      whatsapp: pickStatus("whatsapp"),
      meta: pickStatus("meta"),
    },
  };
}
