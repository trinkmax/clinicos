import "server-only";

import { createClient } from "@/lib/supabase/server";
import { listPlansWithSaldo } from "@/lib/data/commercial";

export interface AgingBucket {
  label: string;
  amount: number;
  count: number;
}
export interface Deudor {
  planId: string;
  patientId: string;
  nombre: string;
  saldo: number;
  costo: number;
  pagado: number;
  diasMora: number;
  estado: string;
}
export interface FinanceOverview {
  facturado: number;
  cobrado: number;
  saldo: number;
  cobradoMes: number;
  planesConSaldo: number;
  enMora: number;
  cobranzaMensual: { label: string; value: number }[];
  aging: AgingBucket[];
  deudores: Deudor[];
}

function daysBetween(from: string, to: Date) {
  const a = new Date(from + (from.length === 10 ? "T00:00:00" : ""));
  return Math.max(
    0,
    Math.floor((to.getTime() - a.getTime()) / 86_400_000),
  );
}

/** Panorama financiero: facturación, cobranza, antigüedad de saldos, deudores. */
export async function financeOverview(): Promise<FinanceOverview> {
  const supabase = await createClient();
  const now = new Date();

  const [plans, paymentsRes] = await Promise.all([
    listPlansWithSaldo(),
    supabase
      .from("payments")
      .select("fecha, importe")
      .order("fecha", { ascending: false })
      .limit(2000),
  ]);

  const payments = (paymentsRes.data ?? []) as {
    fecha: string;
    importe: number;
  }[];

  const facturado = plans.reduce((s, p) => s + p.costo_total, 0);
  const cobrado = plans.reduce((s, p) => s + p.pagado, 0);
  const saldo = plans.reduce((s, p) => s + p.saldo, 0);

  // Cobranza últimos 6 meses (es-AR), por mes.
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("es-AR", { month: "short" }),
    });
  }
  const byMonth = new Map(months.map((m) => [m.key, 0]));
  const curKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
  for (const pay of payments) {
    const key = (pay.fecha ?? "").slice(0, 7);
    if (byMonth.has(key))
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(pay.importe));
  }
  const cobradoMes = byMonth.get(curKey) ?? 0;
  const cobranzaMensual = months.map((m) => ({
    label: m.label,
    value: byMonth.get(m.key) ?? 0,
  }));

  // Antigüedad de saldos (cuentas por cobrar).
  const buckets: Record<string, AgingBucket> = {
    b0: { label: "0–30 días", amount: 0, count: 0 },
    b1: { label: "31–60 días", amount: 0, count: 0 },
    b2: { label: "61–90 días", amount: 0, count: 0 },
    b3: { label: "+90 días", amount: 0, count: 0 },
  };
  const deudores: Deudor[] = [];
  for (const p of plans) {
    if (p.saldo <= 0) continue;
    const dias = daysBetween(p.inicio ?? p.created_at, now);
    const b =
      dias <= 30 ? "b0" : dias <= 60 ? "b1" : dias <= 90 ? "b2" : "b3";
    buckets[b].amount += p.saldo;
    buckets[b].count += 1;
    deudores.push({
      planId: p.id,
      patientId: p.patient_id,
      nombre: p.patient
        ? `${p.patient.apellido}, ${p.patient.nombres}`
        : "Paciente",
      saldo: p.saldo,
      costo: p.costo_total,
      pagado: p.pagado,
      diasMora: dias,
      estado: p.estado,
    });
  }
  deudores.sort((a, b) => b.saldo - a.saldo);

  const enMora = plans.filter(
    (p) =>
      p.estado === "en_mora" ||
      (p.saldo > 0 && daysBetween(p.inicio ?? p.created_at, now) > 60),
  ).length;

  return {
    facturado,
    cobrado,
    saldo,
    cobradoMes,
    planesConSaldo: deudores.length,
    enMora,
    cobranzaMensual,
    aging: Object.values(buckets),
    deudores: deudores.slice(0, 10),
  };
}
