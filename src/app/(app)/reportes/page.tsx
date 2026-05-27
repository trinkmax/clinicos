import type { Metadata } from "next";
import {
  Users,
  Wallet,
  Bell,
  TrendingUp,
  HandCoins,
  CalendarClock,
  PiggyBank,
  BarChart3,
} from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import {
  patientFunnel,
  revenueByProduct,
  followupsPendientes,
} from "@/lib/data/reports";
import { financeOverview } from "@/lib/data/finance";
import { formatARS } from "@/lib/validation/commercial";
import { FOLLOWUP_TIPO_LABEL } from "@/lib/validation/operations";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { moraTone } from "@/lib/ui/status";
import { Donut, Bars, type DonutSegment } from "@/components/charts/charts";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ReportesKpis } from "@/components/reportes/reportes-kpis";
import { RegisterPaymentDialog } from "@/components/commercial/register-payment-dialog";

export const metadata: Metadata = { title: "Reportes" };

const FUNNEL_COLOR: Record<string, string> = {
  activo: "var(--chart-2)",
  en_tratamiento: "var(--chart-1)",
  alta: "var(--chart-4)",
  inactivo: "var(--muted-foreground)",
};
const AGING_COLOR = [
  "var(--success)",
  "var(--warning)",
  "oklch(0.7 0.16 50)",
  "var(--destructive)",
];

export default async function ReportesPage() {
  await requireRole([ROLES.owner, ROLES.admin, ROLES.comercial]);
  const [funnel, revenue, followups, fin] = await Promise.all([
    patientFunnel(),
    revenueByProduct(),
    followupsPendientes(),
    financeOverview(),
  ]);

  const totalPacientes = funnel.reduce((s, f) => s + f.total, 0);
  const fSeg = funnel.filter((f) => f.total > 0);
  const donut: DonutSegment[] = fSeg.map((f) => ({
    label: f.status.replace(/_/g, " "),
    value: f.total,
    color: FUNNEL_COLOR[f.status] ?? "var(--chart-5)",
  }));
  const rev = revenue.filter((r) => r.cobrado > 0).slice(0, 7);
  const totalPend = followups.reduce((s, f) => s + f.total, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        eyebrow={
          <>
            <BarChart3 className="size-3" />
            Análisis
          </>
        }
        title="Reportes y finanzas"
        description="Indicadores clínicos, comerciales, cobranzas y seguimiento."
        size="lg"
      />

      {/* KPIs (isla cliente: el server pasa solo datos serializables) */}
      <ReportesKpis
        kpis={[
          {
            label: "Pacientes",
            value: totalPacientes,
            icon: "users",
            accent: "var(--primary)",
          },
          {
            label: "Facturado",
            value: fin.facturado,
            icon: "wallet",
            accent: "var(--chart-2)",
            money: true,
          },
          {
            label: "Cobrado",
            value: fin.cobrado,
            icon: "trending",
            accent: "var(--success)",
            money: true,
            hint: `${formatARS(fin.cobradoMes)} este mes`,
          },
          {
            label: "Por cobrar",
            value: fin.saldo,
            icon: "coins",
            accent: "var(--destructive)",
            money: true,
            hint: `${fin.planesConSaldo} planes · ${fin.enMora} en mora`,
          },
        ]}
      />

      {/* Embudo + ingresos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.04}>
          <Card className="h-full p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Users className="text-muted-foreground size-4" />
              Embudo de pacientes
            </h2>
            {donut.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin datos.</p>
            ) : (
              <Donut
                segments={donut}
                centerValue={String(totalPacientes)}
                centerLabel="total"
              />
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="h-full p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Wallet className="text-muted-foreground size-4" />
              Ingresos por producto
            </h2>
            {rev.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin datos.</p>
            ) : (
              <Bars
                data={rev.map((r) => ({
                  label: r.producto,
                  value: r.cobrado,
                  sub: `${r.planes} planes`,
                }))}
                currency
              />
            )}
          </Card>
        </Reveal>
      </div>

      {/* Finanzas / Cobranzas */}
      <section className="space-y-3">
        <Reveal>
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <PiggyBank className="text-muted-foreground size-4" />
            Finanzas · Cobranzas
          </h2>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal delay={0.04}>
            <Card className="h-full p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
                <TrendingUp className="text-muted-foreground size-4" />
                Cobranza mensual
              </h3>
              {fin.cobranzaMensual.every((m) => m.value === 0) ? (
                <p className="text-muted-foreground text-sm">
                  Sin cobranzas registradas en los últimos 6 meses.
                </p>
              ) : (
                <Bars
                  data={fin.cobranzaMensual.map((m) => ({
                    label: m.label,
                    value: m.value,
                  }))}
                  currency
                />
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.08}>
            <Card className="h-full p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
                <HandCoins className="text-muted-foreground size-4" />
                Antigüedad de saldos
              </h3>
              {fin.aging.every((a) => a.amount === 0) ? (
                <p className="text-muted-foreground text-sm">
                  No hay saldos pendientes. 🎉
                </p>
              ) : (
                <Bars
                  data={fin.aging.map((a, i) => ({
                    label: a.label,
                    value: a.amount,
                    sub: `${a.count} plan${a.count === 1 ? "" : "es"}`,
                    color: AGING_COLOR[i],
                  }))}
                  currency
                />
              )}
            </Card>
          </Reveal>
        </div>

        <Card className="p-0">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <HandCoins className="text-muted-foreground size-4" />
              Deudores
            </h3>
            <span className="text-muted-foreground text-xs">
              {fin.planesConSaldo} con saldo
            </span>
          </div>
          {fin.deudores.length === 0 ? (
            <EmptyState
              icon={PiggyBank}
              title="Todo cobrado"
              description="No hay saldos pendientes de cobro. Excelente gestión."
              className="m-3 mt-0"
            />
          ) : (
            <ul className="border-t">
              {fin.deudores.map((d) => (
                <li
                  key={d.planId}
                  className="hover:bg-accent/30 flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {d.nombre}
                    </p>
                    <p className="text-muted-foreground text-xs tabular-nums">
                      {formatARS(d.pagado)} / {formatARS(d.costo)} cobrado
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${moraTone(
                      d.diasMora,
                    )}`}
                  >
                    {d.diasMora}d
                  </span>
                  <div className="text-right">
                    <p className="text-destructive text-sm font-semibold tabular-nums">
                      {formatARS(d.saldo)}
                    </p>
                  </div>
                  <RegisterPaymentDialog
                    planId={d.planId}
                    patientId={d.patientId}
                    saldo={d.saldo}
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Seguimientos */}
      <section className="space-y-3">
        <Reveal>
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Bell className="text-muted-foreground size-4" />
            Seguimientos pendientes ({totalPend})
          </h2>
        </Reveal>
        {followups.length === 0 ? (
          <Card className="text-muted-foreground p-8 text-center text-sm">
            Sin seguimientos pendientes.
          </Card>
        ) : (
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {followups.map((f) => (
              <StaggerItem key={f.tipo}>
                <Card className="hairline-top p-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <CalendarClock className="size-3.5" />
                    {FOLLOWUP_TIPO_LABEL[
                      f.tipo as keyof typeof FOLLOWUP_TIPO_LABEL
                    ] ?? f.tipo}
                  </div>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">
                    {f.total}
                  </p>
                  {f.vencidos > 0 ? (
                    <p className="text-destructive mt-1 text-xs font-medium">
                      {f.vencidos} vencidos
                    </p>
                  ) : (
                    <p className="text-success mt-1 text-xs">al día</p>
                  )}
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </div>
  );
}
