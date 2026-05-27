import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TONE = {
  live: "bg-success after:bg-success/30",
  warn: "bg-warning after:bg-warning/30",
  alert: "bg-destructive after:bg-destructive/30",
  idle: "bg-muted-foreground/40 after:bg-muted-foreground/15",
  info: "bg-info after:bg-info/30",
} as const;

export type StatusTone = keyof typeof TONE;

/**
 * Indicador de estado: un dot con halo opcional pulsante.
 * Usar para "WhatsApp conectado", "Worker activo", "En vivo", etc.
 */
export function StatusDot({
  tone = "live",
  pulse = false,
  label,
  className,
}: {
  tone?: StatusTone;
  pulse?: boolean;
  label?: ReactNode;
  className?: string;
}) {
  const dot = (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-2 rounded-full",
        TONE[tone].split(" ")[0],
        pulse &&
          "after:absolute after:inset-0 after:-z-0 after:animate-pulse-ring after:rounded-full",
        pulse && TONE[tone].split(" ")[1],
        className,
      )}
    />
  );

  if (!label) return dot;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex items-center gap-1.5">{dot}</span>
        }
      />
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}
