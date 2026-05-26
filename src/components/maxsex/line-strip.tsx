import { cn } from "@/lib/utils";

import {
  MAXSEX_LINEA_KICKER,
  MAXSEX_LINEA_LABEL,
  type MaxsexLinea,
} from "@/lib/validation/maxsex";

interface LineChip {
  linea: MaxsexLinea;
  color_hex: string;
}

/**
 * Tira horizontal con las 5 líneas Maxsex. Pieza decorativa + de navegación
 * visual (sin links — la card del catálogo es el CTA real).
 */
export function LineStrip({
  lineas,
  className,
}: {
  lineas: LineChip[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ring-foreground/10 bg-card relative flex flex-wrap items-center gap-2.5 overflow-hidden rounded-xl px-3.5 py-3 shadow-xs ring-1",
        className,
      )}
    >
      <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.18em] pr-1">
        Línea
      </p>
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        {lineas.map((l) => (
          <span
            key={l.linea}
            className="ring-foreground/8 inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] font-medium ring-1"
          >
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: l.color_hex }}
            />
            <span className="tracking-tight">
              {MAXSEX_LINEA_LABEL[l.linea]}
            </span>
            <span className="text-muted-foreground hidden lg:inline">
              · {MAXSEX_LINEA_KICKER[l.linea]}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
