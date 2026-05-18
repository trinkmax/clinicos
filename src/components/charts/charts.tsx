"use client";

import { useId, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/** Paleta clínica azul→cian→teal→violeta (espejo de --chart-* en globals). */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Sparkline: tendencia mínima con relleno de luz ────────────────────── */

export function Sparkline({
  data,
  color = "var(--primary)",
  className,
  height = 40,
}: {
  data: number[];
  color?: string;
  className?: string;
  height?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const reduce = useReducedMotion();
  const gid = useId();

  const W = 100;
  const H = 36;
  const pts = data.length > 1 ? data : [data[0] ?? 0, data[0] ?? 0];
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const step = W / (pts.length - 1);
  const coords = pts.map((v, i) => ({
    x: i * step,
    y: H - 4 - ((v - min) / span) * (H - 8),
  }));
  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
    .join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const last = coords[coords.length - 1];

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#spark-${gid})`}
        initial={reduce ? false : { opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: 1, ease: EASE }}
      />
      <motion.circle
        cx={last.x}
        cy={last.y}
        r={2.4}
        fill={color}
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.9, ease: EASE }}
      />
    </svg>
  );
}

/* ─── Donut: distribución con barrido y centro vivo ─────────────────────── */

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function Donut({
  segments,
  size = 168,
  thickness = 16,
  centerLabel,
  centerValue,
  className,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const reduce = useReducedMotion();

  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  // Offsets acumulados sin mutar estado de render (n es pequeño).
  const arcs = segments.map((seg, idx) => {
    const offset =
      segments
        .slice(0, idx)
        .reduce((s, x) => s + x.value, 0) /
      total *
      c;
    return { seg, dash: (seg.value / total) * c, offset };
  });

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-5", className)}
    >
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={thickness}
          />
          {arcs.map(({ seg, dash, offset }, i) => {
            return (
              <motion.circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeDasharray={`${Math.max(dash - 2, 0)} ${c}`}
                initial={reduce ? false : { strokeDashoffset: -c }}
                animate={inView ? { strokeDashoffset: -offset } : {}}
                transition={{
                  duration: 0.95,
                  ease: EASE,
                  delay: 0.08 * i,
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          {centerValue != null && (
            <div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {centerValue}
              </p>
              {centerLabel && (
                <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                  {centerLabel}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <ul className="grid min-w-0 flex-1 gap-1.5">
        {segments.map((seg) => (
          <li
            key={seg.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: seg.color }}
              />
              <span className="text-muted-foreground truncate capitalize">
                {seg.label}
              </span>
            </span>
            <span className="tabular-nums font-medium">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Bars: ranking horizontal con crecimiento fluido ───────────────────── */

export interface BarDatum {
  label: string;
  value: number;
  sub?: string;
  color?: string;
}

export function Bars({
  data,
  format = (n) => n.toLocaleString("es-AR"),
  className,
}: {
  data: BarDatum[];
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const reduce = useReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div ref={ref} className={cn("space-y-3.5", className)}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium">
                {d.label}
                {d.sub && (
                  <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                    {d.sub}
                  </span>
                )}
              </span>
              <span className="tabular-nums font-semibold">
                {format(d.value)}
              </span>
            </div>
            <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: d.color
                    ? d.color
                    : "linear-gradient(90deg, var(--chart-2), var(--primary))",
                }}
                initial={reduce ? { width: `${pct}%` } : { width: 0 }}
                animate={inView ? { width: `${pct}%` } : {}}
                transition={{ duration: 0.9, ease: EASE, delay: 0.06 * i }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
