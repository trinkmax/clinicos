import type { Metadata } from "next";
import {
  Workflow,
  Clock,
  HeartPulse,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listAutomations } from "@/lib/data/marketing";
import { PRESET_LABEL } from "@/lib/validation/marketing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiRow } from "@/components/ui/kpi-row";
import { Reveal } from "@/components/motion/reveal";
import {
  NewAutomationDialog,
  AutomationToggle,
  RunNowButton,
} from "@/components/marketing/marketing-controls";
import { AutomationBuilder } from "@/components/marketing/automation-builder";

export const metadata: Metadata = { title: "Automatizaciones" };

const PRESET_ICON: Record<string, typeof Clock> = {
  controles_15_30_60: Clock,
  adherencia: HeartPulse,
  post_servicio: MessageCircle,
  reactivacion: RefreshCw,
};

export default async function AutomatizacionesPage() {
  await requireRole([ROLES.owner, ROLES.admin, ROLES.marketing]);
  const automations = await listAutomations();
  const activas = automations.filter((a) => a.activo).length;

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <Reveal>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-sm">Operación 24/7</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Automatizaciones
            </h1>
            <p className="text-muted-foreground text-[15px]">
              Controles 15/30/60, adherencia y reactivación — el seguimiento
              que nunca se cae.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RunNowButton />
            <AutomationBuilder />
            <NewAutomationDialog />
          </div>
        </header>
      </Reveal>

      <KpiRow
        className="grid gap-3 sm:grid-cols-3"
        items={[
          {
            label: "Automatizaciones",
            value: automations.length,
            icon: "workflow",
            accent: "var(--primary)",
          },
          {
            label: "Activas",
            value: activas,
            icon: "check",
            accent: "var(--success)",
          },
          {
            label: "Presets",
            value: Object.keys(PRESET_LABEL).length,
            icon: "calendar",
            accent: "var(--chart-3)",
          },
        ]}
      />

      <Reveal delay={0.04}>
        <Card className="bg-primary/[0.04] border-primary/15 hairline-top p-5">
          <div className="flex items-start gap-3">
            <span className="bg-primary/10 text-primary mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg">
              <Workflow className="size-5" />
            </span>
            <div className="space-y-1 text-sm">
              <p className="font-medium">Motor de seguimiento activo</p>
              <p className="text-muted-foreground leading-relaxed">
                Un job programado (pg_cron, 09:00 AR) procesa controles y
                recordatorios de adherencia vencidos y encola el WhatsApp — el
                worker lo envía. «Ejecutar controles ahora» lo dispara manual.
              </p>
            </div>
          </div>
        </Card>
      </Reveal>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PRESET_LABEL).map(([k, label], i) => {
          const Icon = PRESET_ICON[k] ?? Workflow;
          return (
            <Reveal key={k} delay={0.04 + i * 0.03}>
              <Card className="hairline-top h-full p-4">
                <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-lg">
                  <Icon className="size-4" />
                </span>
                <p className="mt-3 text-sm font-medium">{label}</p>
              </Card>
            </Reveal>
          );
        })}
      </section>

      <section className="space-y-3">
        <Reveal>
          <h2 className="text-sm font-semibold tracking-tight">
            Automatizaciones ({automations.length})
          </h2>
        </Reveal>
        {automations.length === 0 ? (
          <EmptyState
            icon={Workflow}
            title="Sin automatizaciones configuradas"
            description="Creá una con «Nueva automatización» o usá el builder visual para armar disparador + pasos."
            action={<NewAutomationDialog />}
          />
        ) : (
          <div className="space-y-2">
            {automations.map((a, i) => {
              const trg = (a.trigger ?? {}) as {
                preset?: string;
                type?: string;
                conditions?: { field: string; op: string; value: string }[];
              };
              const acc = (a.acciones ?? []) as {
                type: string;
                config: Record<string, string>;
              }[];
              const subtitle = trg.preset
                ? (PRESET_LABEL[trg.preset] ?? "Automatización")
                : (trg.type ?? "Automatización");
              return (
                <Reveal key={a.id} delay={i * 0.02}>
                  <Card className="hairline-top flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-9 place-items-center rounded-lg ${
                          a.activo
                            ? "bg-success/12 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Workflow className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{a.nombre}</p>
                        <p className="text-muted-foreground text-xs">
                          {subtitle} · {acc.length} paso(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.activo && (
                        <Badge className="bg-success/12 text-success border-success/20">
                          Activa
                        </Badge>
                      )}
                      <AutomationBuilder
                        triggerLabel="Editar"
                        initial={{
                          id: a.id,
                          nombre: a.nombre,
                          trigger: {
                            type: trg.type ?? "control_vencido",
                            conditions: trg.conditions ?? [],
                          },
                          acciones: acc.length
                            ? acc
                            : [{ type: "enviar_whatsapp", config: {} }],
                        }}
                      />
                      <AutomationToggle id={a.id} activo={a.activo} />
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
