import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/**
 * Estado "en construcción" elegante para módulos que se habilitan en fases
 * posteriores del roadmap. Mantiene la navegación completa y coherente desde el día 1.
 */
export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
  phase,
  bullets,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: number;
  bullets: string[];
}) {
  return (
  <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center">
      <div className="from-primary/12 ring-primary/10 relative grid size-16 place-items-center rounded-2xl bg-gradient-to-br to-[oklch(0.94_0.035_232)] ring-1">
        <Icon className="text-primary size-7" />
        <span className="bg-success absolute -right-1 -bottom-1 size-3 rounded-full ring-2 ring-[var(--background)]" />
      </div>

      <Badge variant="secondary" className="mt-6 gap-1.5">
        <Sparkles className="size-3" />
        Fase {phase} del roadmap
      </Badge>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-[15px] leading-relaxed">
        {description}
      </p>

      <ul className="mt-8 grid w-full max-w-md gap-2 text-left">
        {bullets.map((b) => (
          <li
            key={b}
            className="bg-card text-card-foreground flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-xs"
          >
            <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
            {b}
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground mt-8 text-xs">
        La fundación (auth multi-rol, multitenant, auditoría, diseño) ya está
        operativa. Este módulo se construye sobre esa base.
      </p>
    </div>
  );
}
