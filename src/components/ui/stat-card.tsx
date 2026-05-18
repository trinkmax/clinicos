"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/charts/animated-number";
import { Sparkline } from "@/components/charts/charts";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  format?: (n: number) => string;
  /** Variación vs período previo (signo determina color). */
  delta?: { value: number; suffix?: string };
  spark?: number[];
  accent?: string;
  href?: string;
  hint?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  format,
  delta,
  spark,
  accent = "var(--primary)",
  href,
  hint,
  className,
}: StatCardProps) {
  const positive = (delta?.value ?? 0) >= 0;

  const body = (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="grid size-8 place-items-center rounded-lg"
              style={{
                background: `color-mix(in oklab, ${accent} 12%, transparent)`,
                color: accent,
              }}
            >
              <Icon className="size-4" />
            </span>
            <span className="text-muted-foreground text-[12px] font-medium tracking-wide">
              {label}
            </span>
          </div>
          <p className="text-[28px] leading-none font-semibold tracking-tight tabular-nums">
            {typeof value === "number" ? (
              <AnimatedNumber value={value} format={format} />
            ) : (
              value
            )}
          </p>
        </div>
        {href ? (
          <ArrowUpRight className="text-muted-foreground/60 size-4 transition-all duration-300 group-hover/stat:translate-x-0.5 group-hover/stat:-translate-y-0.5 group-hover/stat:text-foreground" />
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                positive
                  ? "bg-success/12 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {positive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {positive ? "+" : ""}
              {delta.value}
              {delta.suffix ?? "%"}
            </span>
          ) : null}
          {hint ? (
            <span className="text-muted-foreground text-[11px]">{hint}</span>
          ) : null}
        </div>
        {spark && spark.length > 1 ? (
          <div className="w-24 shrink-0">
            <Sparkline data={spark} color={accent} height={32} />
          </div>
        ) : null}
      </div>
    </>
  );

  const shell = cn(
    "group/stat bg-card text-card-foreground relative isolate flex flex-col overflow-hidden rounded-xl p-4 ring-1 ring-foreground/10 shadow-xs transition-all duration-300",
    href &&
      "hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={shell} aria-label={label}>
        {body}
      </Link>
    );
  }
  return <div className={shell}>{body}</div>;
}
