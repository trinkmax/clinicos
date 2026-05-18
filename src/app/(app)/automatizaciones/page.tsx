import type { Metadata } from "next";
import { Workflow, Clock, HeartPulse, MessageCircle, RefreshCw } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listAutomations } from "@/lib/data/marketing";
import { PRESET_LABEL } from "@/lib/validation/marketing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Automatizaciones
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Controles 15/30/60, adherencia y reactivación — el seguimiento que
            nunca se cae
          </p>
        </div>
        <div className="flex gap-2">
          <RunNowButton />
          <AutomationBuilder />
          <NewAutomationDialog />
        </div>
      </header>

      <Card className="bg-primary/[0.04] border-primary/15 p-5">
        <div className="flex items-start gap-3">
          <Workflow className="text-primary mt-0.5 size-5 shrink-0" />
          <div className="space-y-1 text-sm">
            <p className="font-medium">Motor de seguimiento activo</p>
            <p className="text-muted-foreground leading-relaxed">
              Un job programado (pg_cron, 09:00 AR) procesa los controles y
              recordatorios de adherencia vencidos y encola el mensaje de
              WhatsApp — el worker lo envía. «Ejecutar controles ahora» lo
              dispara manualmente para tu clínica.
            </p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PRESET_LABEL).map(([k, label]) => {
          const Icon = PRESET_ICON[k] ?? Workflow;
          return (
            <Card key={k} className="p-4">
              <div className="bg-primary/10 text-primary grid size-9 place-items-center rounded-lg">
                <Icon className="size-4" />
              </div>
              <p className="mt-3 text-sm font-medium">{label}</p>
            </Card>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">
          Automatizaciones ({automations.length})
        </h2>
        {automations.length === 0 ? (
          <Card className="text-muted-foreground p-8 text-center text-sm">
            Sin automatizaciones configuradas. Creá una con «Nueva
            automatización».
          </Card>
        ) : (
          <div className="space-y-2">
            {automations.map((a) => {
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
                <Card
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="text-sm font-medium">{a.nombre}</p>
                    <p className="text-muted-foreground text-xs">
                      {subtitle} · {acc.length} paso(s)
                    </p>
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
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
