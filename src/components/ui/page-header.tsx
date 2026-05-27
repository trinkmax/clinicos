import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Encabezado de página unificado. Reemplaza headers ad-hoc:
 * eyebrow + h1 + descripción + slot de acciones a la derecha y slot
 * de status (badge "En vivo", chips, etc.) bajo la descripción.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  status,
  align = "between",
  size = "md",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
  align?: "between" | "stack";
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end gap-4",
        align === "between" ? "justify-between" : "flex-col items-start",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="text-muted-foreground text-eyebrow inline-flex items-center gap-1.5">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "font-semibold tracking-tight text-balance",
            size === "lg" ? "text-3xl" : "text-2xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            {description}
          </p>
        ) : null}
        {status ? <div className="pt-1">{status}</div> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
