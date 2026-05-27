import type { Metadata } from "next";
import { TrendingUp, Layers, Megaphone } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiRow } from "@/components/ui/kpi-row";
import { PageHeader } from "@/components/ui/page-header";
import { CAMPAIGN_ESTADO_STYLE } from "@/lib/ui/status";
import { Bars } from "@/components/charts/charts";
import { Reveal } from "@/components/motion/reveal";
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

  const ingresoTotal = attribution.reduce((s, a) => s + a.ingreso, 0);
  const bars = attribution
    .filter((a) => a.ingreso > 0)
    .map((a) => ({
      label: FUENTE_LABEL[a.fuente as keyof typeof FUENTE_LABEL] ?? a.fuente,
      value: a.ingreso,
      sub: `${a.contactos} contactos${a.roi != null ? ` · ROI ${a.roi.toFixed(1)}×` : ""}`,
    }));

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        eyebrow={
          <>
            <Megaphone className="size-3" />
            Crecimiento
          </>
        }
        title="Marketing"
        description="Segmentos, campañas y atribución de fuente a ingreso."
        size="lg"
        actions={
          <>
            <NewSegmentDialog />
            <NewCampaignDialog
              segments={segments.map((s) => ({
                id: s.id,
                nombre: s.nombre,
              }))}
              templates={templates.map((t) => ({
                id: t.id,
                nombre: t.nombre,
              }))}
            />
          </>
        }
      />

      <KpiRow
        items={[
          {
            label: "Leads",
            value: stats.leads,
            icon: "users",
            accent: "var(--chart-3)",
          },
          {
            label: "Pacientes",
            value: stats.pacientes,
            icon: "check",
            accent: "var(--success)",
          },
          {
            label: "Seguim. pendientes",
            value: stats.seguimientosPendientes,
            icon: "bell",
            accent: "var(--warning)",
          },
          {
            label: "Ingreso atribuido",
            value: ingresoTotal,
            icon: "trending",
            accent: "var(--primary)",
            money: true,
          },
        ]}
      />

      <Reveal delay={0.04}>
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
            <TrendingUp className="text-muted-foreground size-4" />
            Atribución · ingreso por fuente
          </h2>
          {bars.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Sin datos de atribución todavía.
            </p>
          ) : (
            <>
              <Bars data={bars} currency />
              <div className="mt-5 grid gap-2 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
                {attribution.map((a) => (
                  <div
                    key={a.fuente}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-muted-foreground">
                      {FUENTE_LABEL[
                        a.fuente as keyof typeof FUENTE_LABEL
                      ] ?? a.fuente}
                    </span>
                    <span className="tabular-nums">
                      {formatARS(a.costo)} →{" "}
                      <span className="text-foreground font-medium">
                        {a.roi == null ? "—" : `${a.roi.toFixed(1)}×`}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.06} className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Layers className="text-muted-foreground size-4" />
            Segmentos ({segments.length})
          </h2>
          {segments.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Sin segmentos"
              description="Agrupá contactos por reglas dinámicas para campañas dirigidas."
              className="py-12"
            />
          ) : (
            <div className="space-y-2">
              {segments.map((s) => (
                <Card key={s.id} className="hairline-top p-4">
                  <p className="text-sm font-semibold">{s.nombre}</p>
                  <p className="text-muted-foreground text-xs">
                    {s.descripcion ?? "Segmento dinámico"}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.08} className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Megaphone className="text-muted-foreground size-4" />
            Campañas ({campaigns.length})
          </h2>
          {campaigns.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="Sin campañas"
              description="Creá una campaña sobre un segmento con una plantilla de mensaje."
              className="py-12"
            />
          ) : (
            <div className="space-y-2">
              {campaigns.map((c) => (
                <Card
                  key={c.id}
                  className="hairline-top flex items-center justify-between p-4"
                >
                  <p className="text-sm font-medium">{c.nombre}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      CAMPAIGN_ESTADO_STYLE[
                        c.estado as keyof typeof CAMPAIGN_ESTADO_STYLE
                      ] ?? "",
                    )}
                  >
                    {CAMPAIGN_ESTADO_LABEL[c.estado]}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
