import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Estado vacío con intención: nunca un callejón sin salida.
 * Ícono en chip de marca, mensaje claro y acción a un clic.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-dotgrid relative flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className="from-background pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b to-transparent"
      />
      <div className="relative">
        <div className="from-primary/12 ring-primary/10 grid size-14 place-items-center rounded-2xl bg-gradient-to-br to-[oklch(0.94_0.035_232)] ring-1">
          <Icon className="text-primary size-6" />
        </div>
      </div>
      <p className="relative mt-5 text-[15px] font-semibold tracking-tight">
        {title}
      </p>
      {description && (
        <p className="text-muted-foreground relative mt-1 max-w-sm text-sm leading-relaxed text-balance">
          {description}
        </p>
      )}
      {action && <div className="relative mt-5">{action}</div>}
    </div>
  );
}
