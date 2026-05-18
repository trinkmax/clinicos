import type { Metadata } from "next";
import { Users, UserCheck, Bell, TrendingUp } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import {
  listSegments,
  listCampaigns,
  attributionBySource,
  marketingStats,
} from "@/lib/data/marketing";
import { listTemplates } from "@/lib/data/crm";
import { FUENTE_LABEL } from "@/lib/validation/crm";
import { CAMPAIGN_ESTADO_LABEL } from "@/lib/validation/marketing";
import { formatARS } from "@/lib/validation/commercial";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  NewSegmentDialog,
  NewCampaignDialog,
} from "@/components/marketing/marketing-controls";

export const metadata: Metadata = { title: "Marketing" };

export default async function MarketingPage() {
  await requireRole([
    ROLES.owner,
    ROLES.admin,
    ROLES.marketing,
    ROLES.comercial,
  ]);
  const [stats, attribution, segments, campaigns, templates] =
    await Promise.all([
      marketingStats(),
      attributionBySource(),
      listSegments(),
      listCampaigns(),
      listTemplates(),
    ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Segmentos, campañas y atribución de fuente a ingreso
          </p>
        </div>
        <div className="flex gap-2">
          <NewSegmentDialog />
          <NewCampaignDialog
            segments={segments.map((s) => ({ id: s.id, nombre: s.nombre }))}
            templates={templates.map((t) => ({
              id: t.id,
              nombre: t.nombre,
            }))}
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: "Leads", value: stats.leads },
          { icon: UserCheck, label: "Pacientes", value: stats.pacientes },
          {
            icon: Bell,
            label: "Seguim. pendientes",
            value: stats.seguimientosPendientes,
          },
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

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="text-muted-foreground size-4" />
          Atribución por fuente
        </h2>
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Fuente</th>
                <th className="px-4 py-2.5 text-right font-medium">
                  Contactos
                </th>
                <th className="px-4 py-2.5 text-right font-medium">Costo</th>
                <th className="px-4 py-2.5 text-right font-medium">Ingreso</th>
                <th className="px-4 py-2.5 text-right font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attribution.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-muted-foreground px-4 py-8 text-center"
                  >
                    Sin datos de atribución todavía.
                  </td>
                </tr>
              ) : (
                attribution.map((a) => (
                  <tr key={a.fuente}>
                    <td className="px-4 py-2.5">
                      {FUENTE_LABEL[
                        a.fuente as keyof typeof FUENTE_LABEL
                      ] ?? a.fuente}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {a.contactos}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatARS(a.costo)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatARS(a.ingreso)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {a.roi == null ? "—" : `${a.roi.toFixed(1)}×`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">
            Segmentos ({segments.length})
          </h2>
          {segments.length === 0 ? (
            <Card className="text-muted-foreground p-6 text-center text-sm">
              Sin segmentos.
            </Card>
          ) : (
            <div className="space-y-2">
              {segments.map((s) => (
                <Card key={s.id} className="p-4">
                  <p className="text-sm font-medium">{s.nombre}</p>
                  <p className="text-muted-foreground text-xs">
                    {s.descripcion ?? "Segmento dinámico"}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">
            Campañas ({campaigns.length})
          </h2>
          {campaigns.length === 0 ? (
            <Card className="text-muted-foreground p-6 text-center text-sm">
              Sin campañas.
            </Card>
          ) : (
            <div className="space-y-2">
              {campaigns.map((c) => (
                <Card
                  key={c.id}
                  className="flex items-center justify-between p-4"
                >
                  <p className="text-sm font-medium">{c.nombre}</p>
                  <Badge variant="secondary">
                    {CAMPAIGN_ESTADO_LABEL[c.estado]}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
