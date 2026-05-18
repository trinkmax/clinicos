"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  CircleDollarSign,
  Check,
  CalendarDays,
  Phone,
  FileText,
  ChevronDown,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  setAppointmentStatus,
  toggleAbono,
} from "@/lib/actions/appointments";
import {
  TIPO_LABEL,
  ESTADO_LABEL,
  APPT_ESTADO,
} from "@/lib/validation/appointments";
import type {
  AppointmentWithPatient,
  Professional,
} from "@/lib/data/appointments";
import {
  TIPO_STYLE,
  TIPO_ACCENT,
  ESTADO_STYLE,
  ESTADO_BLOCK,
} from "@/lib/ui/appointments";
import { NewAppointmentDialog } from "@/components/turnero/new-appointment-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PX_PER_MIN = 1.1;
const MIN_BLOCK = 30;

function hhmmToMin(s: string) {
  const [h, m] = s.split(":");
  return Number(h) * 60 + Number(m);
}
function minToHHMM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function shiftDate(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function prettyDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
function todayAR() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}
function nowMinAR() {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  return hhmmToMin(p);
}
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")
  ).toUpperCase();
}

interface Placed {
  appt: AppointmentWithPatient;
  startMin: number;
  endMin: number;
  lane: number;
  lanes: number;
}

/** Empaqueta turnos solapados en carriles (cluster → columnas paralelas). */
function packColumn(appts: AppointmentWithPatient[]): Placed[] {
  const items = appts
    .map((a) => {
      const startMin = hhmmToMin(a.hora.slice(0, 5));
      return {
        appt: a,
        startMin,
        endMin: startMin + Math.max(a.duracion_min, MIN_BLOCK),
      };
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const out: Placed[] = [];
  let cluster: (typeof items)[number][] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (!cluster.length) return;
    const laneEnds: number[] = [];
    const laneOf = new Map<(typeof cluster)[number], number>();
    for (const it of cluster) {
      let lane = laneEnds.findIndex((e) => e <= it.startMin);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(it.endMin);
      } else {
        laneEnds[lane] = it.endMin;
      }
      laneOf.set(it, lane);
    }
    const lanes = laneEnds.length;
    for (const it of cluster) {
      out.push({ ...it, lane: laneOf.get(it) ?? 0, lanes });
    }
    cluster = [];
    clusterEnd = -1;
  };

  for (const it of items) {
    if (cluster.length && it.startMin >= clusterEnd) flush();
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, it.endMin);
  }
  flush();
  return out;
}

export function TurneroBoard({
  fecha,
  appointments,
  stats,
  professionals,
  canEdit,
}: {
  fecha: string;
  appointments: AppointmentWithPatient[];
  stats: { total: number; atendidos: number; abonaron: number };
  professionals: Professional[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [pending, start] = useTransition();
  const [selId, setSelId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("todos");
  const [tick, setTick] = useState(0);

  // Tablero en vivo.
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel(`turnero:${fecha}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `fecha=eq.${fecha}`,
        },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [fecha, router]);

  // Línea de "ahora" — actualiza cada minuto.
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const profMap = useMemo(() => {
    const m = new Map<string, Professional>();
    for (const p of professionals) {
      m.set(p.id, p);
      m.set(p.user_id, p);
    }
    return m;
  }, [professionals]);

  // Columnas con sus turnos.
  const columns = useMemo<
    {
      key: string;
      prof: Professional | null;
      label: string;
      appts: AppointmentWithPatient[];
    }[]
  >(() => {
    const byKey = new Map<
      string,
      { prof: Professional | null; label: string; appts: AppointmentWithPatient[] }
    >();
    for (const a of appointments) {
      const prof = a.profesional_id
        ? (profMap.get(a.profesional_id) ?? null)
        : null;
      const key = prof ? prof.id : "__none__";
      if (!byKey.has(key)) {
        byKey.set(key, {
          prof,
          label: prof?.full_name ?? "Sin asignar",
          appts: [],
        });
      }
      byKey.get(key)!.appts.push(a);
    }

    if (filter !== "todos") {
      const prof = professionals.find((p) => p.id === filter) ?? null;
      return [
        {
          key: filter,
          prof,
          label: prof?.full_name ?? "Profesional",
          appts: byKey.get(filter)?.appts ?? [],
        },
      ];
    }

    const cols: {
      key: string;
      prof: Professional | null;
      label: string;
      appts: AppointmentWithPatient[];
    }[] = professionals
      .filter((p) => byKey.has(p.id))
      .map((p) => ({
        key: p.id,
        prof: p,
        label: p.full_name ?? "Profesional",
        appts: byKey.get(p.id)!.appts,
      }));
    if (byKey.has("__none__")) {
      cols.push({
        key: "__none__",
        prof: null,
        label: "Sin asignar",
        appts: byKey.get("__none__")!.appts,
      });
    }
    if (cols.length === 0 && appointments.length > 0) {
      cols.push({
        key: "__all__",
        prof: null,
        label: "Agenda",
        appts: appointments,
      });
    }
    return cols;
  }, [appointments, professionals, profMap, filter]);

  // Rango horario dinámico.
  const { dayStart, dayEnd, hours } = useMemo(() => {
    let lo = 8 * 60;
    let hi = 21 * 60;
    for (const a of appointments) {
      const s = hhmmToMin(a.hora.slice(0, 5));
      lo = Math.min(lo, s);
      hi = Math.max(hi, s + Math.max(a.duracion_min, MIN_BLOCK));
    }
    const ds = Math.max(6 * 60, Math.floor(lo / 60) * 60);
    const de = Math.min(23 * 60, Math.ceil(hi / 60) * 60);
    const hrs: number[] = [];
    for (let h = ds / 60; h <= de / 60; h++) hrs.push(h);
    return { dayStart: ds, dayEnd: de, hours: hrs };
  }, [appointments]);

  const totalPx = (dayEnd - dayStart) * PX_PER_MIN;
  const isToday = fecha === todayAR();
  const nowMin = nowMinAR();
  void tick;
  const showNow = isToday && nowMin >= dayStart && nowMin <= dayEnd;
  const nowTop = (nowMin - dayStart) * PX_PER_MIN;

  const sel = selId
    ? (appointments.find((a) => a.id === selId) ?? null)
    : null;

  function goto(date: string) {
    router.push(`/turnero?date=${date}`);
  }
  function changeStatus(id: string, estado: string) {
    start(async () => {
      const r = await setAppointmentStatus(id, estado);
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  }
  function flipAbono(id: string, value: boolean) {
    start(async () => {
      const r = await toggleAbono(id, value);
      if (r.ok) router.refresh();
      else toast.error(r.error);
    });
  }

  const gridCols = `56px repeat(${Math.max(columns.length, 1)}, minmax(170px, 1fr))`;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => goto(shiftDate(fecha, -1))}
              className="hover:bg-accent text-muted-foreground hover:text-foreground grid size-9 place-items-center rounded-lg border transition-colors"
              aria-label="Día anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => goto(todayAR())}
              className={cn(
                "h-9 rounded-lg border px-3 text-sm font-medium transition-colors",
                isToday
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "hover:bg-accent",
              )}
            >
              Hoy
            </button>
            <button
              onClick={() => goto(shiftDate(fecha, 1))}
              className="hover:bg-accent text-muted-foreground hover:text-foreground grid size-9 place-items-center rounded-lg border transition-colors"
              aria-label="Día siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight capitalize">
              {prettyDate(fecha)}
            </h1>
            <p className="text-muted-foreground text-xs">
              {stats.total} turnos · {stats.atendidos} atendidos ·{" "}
              {stats.abonaron} abonaron
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-input bg-background hover:bg-accent focus-visible:ring-ring h-9 cursor-pointer appearance-none rounded-lg border pr-8 pl-3 text-sm outline-none transition-colors focus-visible:ring-2"
              aria-label="Filtrar por profesional"
            >
              <option value="todos">Todos los profesionales</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? "Profesional"}
                </option>
              ))}
            </select>
            <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2" />
          </div>
          <NewAppointmentDialog fecha={fecha} />
        </div>
      </header>

      {/* ── Estado vacío ───────────────────────────────────────────── */}
      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin turnos este día"
          description="La agenda está despejada. Agendá un turno o navegá a otro día con las flechas."
          action={<NewAppointmentDialog fecha={fecha} />}
        />
      ) : (
        <>
          {/* ── Grilla (desktop) ───────────────────────────────────── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
            className="bg-card hidden overflow-hidden rounded-xl shadow-xs ring-1 ring-foreground/10 lg:block"
            aria-busy={pending}
          >
            <div className="max-h-[calc(100dvh-13rem)] overflow-auto">
              <div
                className="relative grid min-w-max"
                style={{ gridTemplateColumns: gridCols }}
              >
                {/* fila de cabeceras (sticky top) */}
                <div className="surface-glass sticky top-0 left-0 z-30 border-r border-b" />
                {columns.map((c) => (
                  <div
                    key={`h-${c.key}`}
                    className="surface-glass sticky top-0 z-20 flex items-center gap-2.5 border-b px-3 py-2.5"
                  >
                    <span className="bg-primary/10 text-primary ring-primary/15 grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold ring-1">
                      {c.prof ? initials(c.label) : "—"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {c.label}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {c.appts.length} turno
                        {c.appts.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                ))}

                {/* columna de horas (sticky left) */}
                <div
                  className="bg-card sticky left-0 z-10 border-r"
                  style={{ height: totalPx }}
                >
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="text-muted-foreground relative text-right text-[11px] tabular-nums"
                      style={{ height: 60 * PX_PER_MIN }}
                    >
                      <span className="absolute -top-1.5 right-2">
                        {h}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* columnas de profesionales */}
                {columns.map((c, ci) => {
                  const placed = packColumn(c.appts);
                  return (
                    <div
                      key={c.key}
                      className={cn(
                        "relative",
                        ci < columns.length - 1 && "border-r",
                      )}
                      style={{
                        height: totalPx,
                        backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${60 * PX_PER_MIN - 1}px, var(--border) ${60 * PX_PER_MIN - 1}px, var(--border) ${60 * PX_PER_MIN}px)`,
                      }}
                    >
                      {placed.map(({ appt: a, startMin, lane, lanes }) => {
                        const name = a.patient
                          ? `${a.patient.apellido}, ${a.patient.nombres}`
                          : (a.nombre_contacto ?? "Sin nombre");
                        const top = (startMin - dayStart) * PX_PER_MIN;
                        const height = Math.max(
                          a.duracion_min * PX_PER_MIN - 3,
                          MIN_BLOCK,
                        );
                        const width = `calc(${100 / lanes}% - 5px)`;
                        const left = `calc(${(lane * 100) / lanes}% + 3px)`;
                        return (
                          <button
                            key={a.id}
                            onClick={() => setSelId(a.id)}
                            style={{ top, height, left, width }}
                            className={cn(
                              "group absolute overflow-hidden rounded-lg border px-2 py-1 text-left transition-all duration-200 hover:z-10 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                              ESTADO_BLOCK[a.estado] ?? ESTADO_BLOCK.programado,
                            )}
                          >
                            <span
                              className="absolute inset-y-0 left-0 w-1"
                              style={{
                                background:
                                  TIPO_ACCENT[a.tipo] ?? "var(--border)",
                              }}
                            />
                            <p className="truncate pl-1.5 text-[12px] leading-tight font-semibold">
                              {name}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-1 pl-1.5 text-[10px] tabular-nums">
                              {a.modalidad === "videollamada" ? (
                                <Video className="size-2.5" />
                              ) : (
                                <MapPin className="size-2.5" />
                              )}
                              {a.hora.slice(0, 5)}
                              {height > 44 && (
                                <>
                                  {" "}
                                  ·{" "}
                                  {minToHHMM(
                                    startMin + a.duracion_min,
                                  )}
                                </>
                              )}
                            </p>
                            {height > 58 && (
                              <span
                                className={cn(
                                  "mt-0.5 ml-1.5 inline-block rounded px-1 py-px text-[9px] font-medium",
                                  TIPO_STYLE[a.tipo],
                                )}
                              >
                                {TIPO_LABEL[
                                  a.tipo as keyof typeof TIPO_LABEL
                                ] ?? a.tipo}
                              </span>
                            )}
                            {a.abono && (
                              <Check className="text-success absolute top-1 right-1 size-3" />
                            )}
                          </button>
                        );
                      })}

                      {/* línea de ahora */}
                      {showNow && (
                        <div
                          className="pointer-events-none absolute right-0 left-0 z-[5]"
                          style={{ top: nowTop }}
                        >
                          <div className="bg-destructive h-px w-full" />
                          {ci === 0 && (
                            <span className="bg-destructive absolute -top-1 -left-1 size-2 rounded-full" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Lista (mobile) ─────────────────────────────────────── */}
          <div className="space-y-2 lg:hidden" aria-busy={pending}>
            {appointments.map((a) => {
              const name = a.patient
                ? `${a.patient.apellido}, ${a.patient.nombres}`
                : (a.nombre_contacto ?? "Sin nombre");
              return (
                <button
                  key={a.id}
                  onClick={() => setSelId(a.id)}
                  className="bg-card relative flex w-full items-center gap-3 overflow-hidden rounded-xl p-3 text-left shadow-xs ring-1 ring-foreground/10 transition-all active:scale-[0.99]"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1"
                    style={{
                      background: TIPO_ACCENT[a.tipo] ?? "var(--border)",
                    }}
                  />
                  <div className="w-12 shrink-0 pl-1.5 text-center">
                    <p className="text-[15px] font-semibold tabular-nums">
                      {a.hora.slice(0, 5)}
                    </p>
                    <p className="text-muted-foreground text-[10px]">
                      {a.duracion_min}′
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      {a.modalidad === "videollamada" ? (
                        <Video className="size-3" />
                      ) : (
                        <MapPin className="size-3" />
                      )}
                      <span className="capitalize">{a.modalidad}</span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-medium",
                      ESTADO_STYLE[a.estado],
                    )}
                  >
                    {ESTADO_LABEL[a.estado as keyof typeof ESTADO_LABEL] ??
                      a.estado}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── Panel de detalle ───────────────────────────────────────── */}
      <Sheet
        open={!!sel}
        onOpenChange={(o: boolean) => {
          if (!o) setSelId(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-md"
        >
          {sel && (
            <DetailPanel
              a={sel}
              prof={
                sel.profesional_id
                  ? (profMap.get(sel.profesional_id) ?? null)
                  : null
              }
              canEdit={canEdit}
              pending={pending}
              onStatus={changeStatus}
              onAbono={flipAbono}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailPanel({
  a,
  prof,
  canEdit,
  pending,
  onStatus,
  onAbono,
}: {
  a: AppointmentWithPatient;
  prof: Professional | null;
  canEdit: boolean;
  pending: boolean;
  onStatus: (id: string, estado: string) => void;
  onAbono: (id: string, value: boolean) => void;
}) {
  const name = a.patient
    ? `${a.patient.apellido}, ${a.patient.nombres}`
    : (a.nombre_contacto ?? "Sin nombre");
  const startMin = hhmmToMin(a.hora.slice(0, 5));
  const tel = a.telefono_contacto?.replace(/\D/g, "");

  return (
    <>
      <SheetHeader className="border-b p-5">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary ring-primary/15 grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold ring-1">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <SheetTitle className="truncate text-[17px]">
              {name}
            </SheetTitle>
            <p className="text-muted-foreground text-xs">
              {TIPO_LABEL[a.tipo as keyof typeof TIPO_LABEL] ?? a.tipo} ·{" "}
              {a.duracion_min} min
            </p>
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <dl className="space-y-3 text-sm">
          <Row icon={Clock3} label="Horario">
            <span className="tabular-nums">
              {a.hora.slice(0, 5)} – {minToHHMM(startMin + a.duracion_min)}
            </span>
          </Row>
          <Row
            icon={a.modalidad === "videollamada" ? Video : MapPin}
            label="Modalidad"
          >
            <span className="capitalize">{a.modalidad}</span>
            {a.virtual_flexible && (
              <span className="text-muted-foreground">
                {" "}
                · flexible
              </span>
            )}
          </Row>
          {prof && (
            <Row icon={FileText} label="Profesional">
              {prof.full_name ?? "—"}
            </Row>
          )}
          {a.telefono_contacto && (
            <Row icon={Phone} label="Teléfono">
              <span className="tabular-nums">{a.telefono_contacto}</span>
            </Row>
          )}
        </dl>

        {a.notas && (
          <div className="bg-muted/40 rounded-lg border p-3">
            <p className="text-muted-foreground mb-1 text-[11px] font-medium tracking-wide uppercase">
              Notas
            </p>
            <p className="text-sm whitespace-pre-wrap">{a.notas}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-sm">Estado</span>
          {canEdit ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={pending}
                className={cn(
                  "focus-visible:ring-ring inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-medium outline-none focus-visible:ring-2 disabled:opacity-50",
                  ESTADO_STYLE[a.estado],
                )}
              >
                {ESTADO_LABEL[a.estado as keyof typeof ESTADO_LABEL] ??
                  a.estado}
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {APPT_ESTADO.map((e) => (
                  <DropdownMenuItem
                    key={e}
                    onSelect={() => onStatus(a.id, e)}
                  >
                    {ESTADO_LABEL[e]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium",
                ESTADO_STYLE[a.estado],
              )}
            >
              {ESTADO_LABEL[a.estado as keyof typeof ESTADO_LABEL] ??
                a.estado}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-sm">Pago</span>
          <button
            onClick={() => canEdit && onAbono(a.id, !a.abono)}
            disabled={!canEdit || pending}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors disabled:opacity-60",
              a.abono
                ? "bg-success/12 text-success border-success/20"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {a.abono ? (
              <Check className="size-3.5" />
            ) : (
              <CircleDollarSign className="size-3.5" />
            )}
            {a.abono ? "Abonó" : "Pendiente"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t p-4">
        {tel ? (
          <a
            href={`https://wa.me/${tel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-success/10 text-success hover:bg-success/15 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Phone className="size-4" />
            WhatsApp
          </a>
        ) : (
          <span className="text-muted-foreground bg-muted/50 inline-flex h-9 items-center justify-center rounded-lg text-sm">
            Sin teléfono
          </span>
        )}
        {a.patient ? (
          <Link
            href={`/pacientes/${a.patient.id}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <FileText className="size-4" />
            Ir a la ficha
          </Link>
        ) : (
          <span className="text-muted-foreground bg-muted/50 inline-flex h-9 items-center justify-center rounded-lg text-sm">
            Sin ficha
          </span>
        )}
      </div>
    </>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="text-muted-foreground size-4 shrink-0" />
      <dt className="text-muted-foreground w-24 shrink-0 text-xs">
        {label}
      </dt>
      <dd className="flex-1 font-medium">{children}</dd>
    </div>
  );
}
