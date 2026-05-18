"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarClock,
  CalendarDays,
  LayoutDashboard,
  MapPin,
  MessagesSquare,
  Megaphone,
  Settings,
  Users,
  Video,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth/roles";
import type { DashboardData } from "@/lib/data/dashboard";
import { formatARS } from "@/lib/validation/commercial";
import {
  TIPO_STYLE,
  TIPO_ACCENT,
  ESTADO_STYLE,
} from "@/lib/ui/appointments";
import { TIPO_LABEL, ESTADO_LABEL } from "@/lib/validation/appointments";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Donut, Bars, type DonutSegment } from "@/components/charts/charts";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const ICONS: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/turnero": CalendarClock,
  "/pacientes": Users,
  "/comercial": Wallet,
  "/inbox": MessagesSquare,
  "/marketing": Megaphone,
  "/automatizaciones": Workflow,
  "/reportes": BarChart3,
  "/ajustes": Settings,
};

const FUNNEL_COLOR: Record<string, string> = {
  activo: "var(--chart-2)",
  en_tratamiento: "var(--chart-1)",
  alta: "var(--chart-4)",
  inactivo: "var(--muted-foreground)",
};

interface Module {
  title: string;
  href: string;
  description: string;
  phase: number;
}

export function DashboardView({
  data,
  roleLabel,
  greeting,
  modules,
}: {
  data: DashboardData;
  role: Role;
  roleLabel: string;
  greeting: string;
  modules: Module[];
}) {
  const router = useRouter();

  // Centro de control en vivo: turnos del día cambian → refrescar suave.
  useEffect(() => {
    if (!data.appointments) return;
    const supabase = createClient();
    const ch = supabase
      .channel(`dashboard:${data.fecha}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `fecha=eq.${data.fecha}`,
        },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [data.fecha, data.appointments, router]);

  const fechaLarga = new Date(data.fecha + "T00:00:00").toLocaleDateString(
    "es-AR",
    { weekday: "long", day: "numeric", month: "long" },
  );

  // KPIs visibles según lo que el rol pudo cargar (null = oculto).
  const kpis = [
    data.patients && {
      label: "Pacientes",
      value: data.patients.total,
      icon: Users,
      accent: "var(--primary)",
      href: "/pacientes",
      hint: `${data.patients.enTratamiento} en tratamiento`,
    },
    data.appointments && {
      label: "Turnos hoy",
      value: data.appointments.stats.total,
      icon: CalendarClock,
      accent: "var(--chart-2)",
      href: "/turnero",
      hint: `${data.appointments.stats.atendidos} atendidos · ${data.appointments.stats.abonaron} abonaron`,
      spark: hourBuckets(data.appointments.today),
    },
    data.commercial && {
      label: "Cobrado",
      value: data.commercial.cobrado,
      icon: Wallet,
      accent: "var(--success)",
      href: "/comercial",
      hint: `${formatARS(data.commercial.saldo)} por cobrar`,
      format: formatARS,
    },
    data.crm && {
      label: "Conversaciones",
      value: data.crm.convAbiertas,
      icon: MessagesSquare,
      accent: "var(--chart-3)",
      href: "/inbox",
      hint: `${data.crm.leads} leads activos`,
    },
    data.ops && {
      label: "Seguimientos",
      value: data.ops.seguimientosPendientes,
      icon: Bell,
      accent: "var(--warning)",
      href: "/reportes",
      hint:
        data.ops.seguimientosVencidos > 0
          ? `${data.ops.seguimientosVencidos} vencidos`
          : "al día",
    },
  ].filter(Boolean) as {
    label: string;
    value: number;
    icon: LucideIcon;
    accent: string;
    href: string;
    hint: string;
    spark?: number[];
    format?: (n: number) => string;
  }[];

  const funnel = data.funnel?.filter((f) => f.total > 0) ?? [];
  const funnelTotal = funnel.reduce((s, f) => s + f.total, 0);
  const donutSegs: DonutSegment[] = funnel.map((f) => ({
    label: f.status.replace(/_/g, " "),
    value: f.total,
    color: FUNNEL_COLOR[f.status] ?? "var(--chart-5)",
  }));
  const revenue = (data.revenue ?? [])
    .filter((r) => r.cobrado > 0)
    .slice(0, 6);
  const hasSidePanels = funnel.length > 0 || !!data.followups?.length;

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <Reveal>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              {greeting} ·{" "}
              <span className="text-foreground font-medium">{roleLabel}</span>
              <span className="bg-success/12 text-success ml-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium">
                <span className="bg-success animate-pulse-ring size-1.5 rounded-full" />
                En vivo
              </span>
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              Centro de control
            </h1>
            <p className="text-muted-foreground text-[15px] capitalize">
              {fechaLarga}
            </p>
          </div>
        </header>
      </Reveal>

      {/* ── KPIs ───────────────────────────────────────────────────── */}
      {kpis.length > 0 && (
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <StaggerItem key={k.label}>
              <StatCard
                label={k.label}
                value={k.value}
                icon={k.icon}
                accent={k.accent}
                href={k.href}
                hint={k.hint}
                spark={k.spark}
                format={k.format}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* ── Agenda + paneles ───────────────────────────────────────── */}
      <div
        className={cn(
          "grid gap-4",
          hasSidePanels && "lg:grid-cols-3",
        )}
      >
        {data.appointments && (
          <Reveal
            delay={0.05}
            className={cn(hasSidePanels && "lg:col-span-2")}
          >
            <Card className="h-full gap-0 p-0">
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
                    <CalendarClock className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight">
                      Agenda de hoy
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      {data.appointments.today.length} turnos programados
                    </p>
                  </div>
                </div>
                <Link
                  href={`/turnero?date=${data.fecha}`}
                  className="text-primary hover:bg-primary/8 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                >
                  Ver turnero
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              {data.appointments.today.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Día despejado"
                  description="No hay turnos para hoy. Cuando se agende uno, aparecerá acá al instante."
                  className="m-3 mt-0"
                />
              ) : (
                <ul className="border-t">
                  {data.appointments.today.slice(0, 7).map((a) => {
                    const nombre = a.patient
                      ? `${a.patient.apellido}, ${a.patient.nombres}`
                      : (a.nombre_contacto ?? "Sin nombre");
                    return (
                      <li key={a.id}>
                        <Link
                          href={`/turnero?date=${data.fecha}`}
                          className="hover:bg-accent/40 group/row relative flex items-center gap-4 px-5 py-3 transition-colors"
                        >
                          <span
                            className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full"
                            style={{
                              background:
                                TIPO_ACCENT[a.tipo] ?? "var(--border)",
                            }}
                          />
                          <div className="w-12 shrink-0 text-center">
                            <p className="text-[15px] leading-tight font-semibold tabular-nums">
                              {a.hora.slice(0, 5)}
                            </p>
                            <p className="text-muted-foreground text-[10px]">
                              {a.duracion_min}′
                            </p>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {nombre}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                              {a.modalidad === "videollamada" ? (
                                <Video className="size-3" />
                              ) : (
                                <MapPin className="size-3" />
                              )}
                              <span className="capitalize">
                                {a.modalidad}
                              </span>
                              {a.virtual_flexible && " · flexible"}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "hidden sm:inline-flex",
                              TIPO_STYLE[a.tipo],
                            )}
                          >
                            {TIPO_LABEL[
                              a.tipo as keyof typeof TIPO_LABEL
                            ] ?? a.tipo}
                          </Badge>
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-[11px] font-medium",
                              ESTADO_STYLE[a.estado],
                            )}
                          >
                            {ESTADO_LABEL[
                              a.estado as keyof typeof ESTADO_LABEL
                            ] ?? a.estado}
                          </span>
                          <ArrowUpRight className="text-muted-foreground/0 group-hover/row:text-muted-foreground size-4 transition-colors" />
                        </Link>
                      </li>
                    );
                  })}
                  {data.appointments.today.length > 7 && (
                    <li className="border-t">
                      <Link
                        href={`/turnero?date=${data.fecha}`}
                        className="text-muted-foreground hover:text-foreground block px-5 py-3 text-center text-xs font-medium transition-colors"
                      >
                        +{data.appointments.today.length - 7} turnos más en el
                        turnero
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </Card>
          </Reveal>
        )}

        {hasSidePanels && (
          <Reveal delay={0.1} className="space-y-4">
            {funnel.length > 0 && (
              <Card className="p-5">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <BarChart3 className="text-muted-foreground size-4" />
                  Embudo de pacientes
                </h2>
                <Donut
                  segments={donutSegs}
                  centerValue={String(funnelTotal)}
                  centerLabel="total"
                />
              </Card>
            )}

            {data.followups && data.followups.length > 0 && (
              <Card className="p-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <Bell className="text-muted-foreground size-4" />
                  Seguimientos
                </h2>
                <ul className="space-y-2">
                  {data.followups.slice(0, 4).map((f) => (
                    <li
                      key={f.tipo}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-muted-foreground capitalize">
                        {f.tipo.replace(/_/g, " ")}
                      </span>
                      <span className="flex items-center gap-2">
                        {f.vencidos > 0 && (
                          <span className="bg-destructive/10 text-destructive rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">
                            {f.vencidos} venc.
                          </span>
                        )}
                        <span className="tabular-nums font-semibold">
                          {f.total}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </Reveal>
        )}
      </div>

      {/* ── Ingresos por producto ──────────────────────────────────── */}
      {revenue.length > 0 && (
        <Reveal delay={0.05}>
          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Wallet className="text-muted-foreground size-4" />
              Ingresos por producto
            </h2>
            <Bars
              data={revenue.map((r) => ({
                label: r.producto,
                value: r.cobrado,
                sub: `${r.planes} planes`,
              }))}
              format={formatARS}
            />
          </Card>
        </Reveal>
      )}

      {/* ── Lanzador de módulos ────────────────────────────────────── */}
      <section className="space-y-3">
        <Reveal>
          <h2 className="text-sm font-semibold tracking-tight">
            Explorar el sistema
          </h2>
        </Reveal>
        <Stagger
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          delay={0.02}
        >
          {modules.map((m) => {
            const Icon = ICONS[m.href] ?? LayoutDashboard;
            const available = m.phase === 0;
            return (
              <StaggerItem key={m.href}>
                <Card
                  interactive
                  className="hairline-top group/mod relative h-full p-5"
                >
                  <Link
                    href={m.href}
                    className="absolute inset-0"
                    aria-label={m.title}
                  />
                  <div className="flex items-start justify-between">
                    <span className="bg-primary/10 text-primary ring-primary/10 grid size-10 place-items-center rounded-xl ring-1 transition-transform duration-300 group-hover/mod:scale-105">
                      <Icon className="size-5" />
                    </span>
                    {available ? (
                      <span className="bg-success/12 text-success inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                        <span className="bg-success size-1.5 rounded-full" />
                        Operativo
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">
                        Fase {m.phase}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-4 flex items-center gap-1 text-[15px] font-semibold tracking-tight">
                    {m.title}
                    <ArrowUpRight className="text-muted-foreground size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover/mod:translate-x-0 group-hover/mod:opacity-100" />
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {m.description}
                  </p>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>
    </div>
  );
}

/** Turnos agrupados por franja horaria → mini-tendencia honesta del día. */
function hourBuckets(
  appts: { hora: string }[],
): number[] | undefined {
  if (appts.length < 2) return undefined;
  const buckets = new Array(13).fill(0); // 8:00 → 20:00
  for (const a of appts) {
    const h = Number(a.hora.slice(0, 2));
    const idx = Math.min(Math.max(h - 8, 0), 12);
    buckets[idx] += 1;
  }
  return buckets;
}
