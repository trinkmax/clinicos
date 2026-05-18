import type { Metadata } from "next";
import { BarChart3, Users, Wallet, Bell } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import {
  patientFunnel,
  revenueByProduct,
  followupsPendientes,
} from "@/lib/data/reports";
import { formatARS } from "@/lib/validation/commercial";
import { FOLLOWUP_TIPO_LABEL } from "@/lib/validation/operations";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Reportes" };

function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
      <div
        className="bg-primary h-full rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default async function ReportesPage() {
  await requireRole([ROLES.owner, ROLES.admin, ROLES.comercial]);
  const [funnel, revenue, followups] = await Promise.all([
    patientFunnel(),
    revenueByProduct(),
    followupsPendientes(),
  ]);

  const totalPacientes = funnel.reduce((s, f) => s + f.total, 0);
  const totalCobrado = revenue.reduce((s, r) => s + r.cobrado, 0);
  const totalFacturado = revenue.reduce((s, r) => s + r.facturado, 0);
  const totalPend = followups.reduce((s, f) => s + f.total, 0);
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.total));
  const maxRev = Math.max(1, ...revenue.map((r) => r.facturado));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Indicadores clínicos, comerciales y de seguimiento
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, label: "Pacientes", value: String(totalPacientes) },
          { icon: Wallet, label: "Facturado", value: formatARS(totalFacturado) },
          { icon: Wallet, label: "Cobrado", value: formatARS(totalCobrado) },
          { icon: Bell, label: "Seguim. pendientes", value: String(totalPend) },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <k.icon className="size-4" />
              {k.label}
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {k.value}
            </p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="text-muted-foreground size-4" />
            Embudo de pacientes
          </h2>
          {funnel.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin datos.</p>
          ) : (
            <div className="space-y-3">
              {funnel.map((f) => (
                <div key={f.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize">
                      {f.status.replace("_", " ")}
                    </span>
                    <span className="tabular-nums font-medium">
                      {f.total}
                    </span>
                  </div>
                  <Bar value={f.total} max={maxFunnel} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Wallet className="text-muted-foreground size-4" />
            Ingresos por producto
          </h2>
          {revenue.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin datos.</p>
          ) : (
            <div className="space-y-3">
              {revenue.map((r) => (
                <div key={r.producto} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>
                      {r.producto}{" "}
                      <span className="text-muted-foreground">
                        ({r.planes} planes)
                      </span>
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatARS(r.cobrado)} / {formatARS(r.facturado)}
                    </span>
                  </div>
                  <Bar value={r.cobrado} max={maxRev} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="text-muted-foreground size-4" />
          Seguimientos pendientes por tipo
        </h2>
        {followups.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sin seguimientos pendientes.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {followups.map((f) => (
              <div key={f.tipo} className="rounded-xl border p-4">
                <p className="text-2xl font-semibold tabular-nums">
                  {f.total}
                </p>
                <p className="text-muted-foreground text-xs">
                  {FOLLOWUP_TIPO_LABEL[
                    f.tipo as keyof typeof FOLLOWUP_TIPO_LABEL
                  ] ?? f.tipo}
                </p>
                {f.vencidos > 0 && (
                  <p className="text-destructive mt-1 text-xs font-medium">
                    {f.vencidos} vencidos
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
