import Link from "next/link";
import { ArrowUpRight, Mars, Venus, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MAXSEX_AUDIENCIA_LABEL,
  MAXSEX_LINEA_KICKER,
  MAXSEX_LINEA_LABEL,
  formatARS,
  stockStatus,
  type MaxsexAudiencia,
  type MaxsexLinea,
} from "@/lib/validation/maxsex";
import { ProductBox } from "@/components/maxsex/product-box";

interface ProductCardProps {
  slug: string;
  linea: MaxsexLinea;
  nombre_corto: string;
  color_hex: string;
  audiencia: MaxsexAudiencia;
  beneficios: string[];
  descripcion_corta: string;
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  destacado: boolean;
}

const AUDIENCIA_ICON: Record<MaxsexAudiencia, typeof Mars> = {
  hombre: Mars,
  mujer: Venus,
  unisex: Sparkles,
};

function StockBadge({
  actual,
  minimo,
}: {
  actual: number;
  minimo: number;
}) {
  const status = stockStatus(actual, minimo);
  if (status === "sin_stock") {
    return (
      <Badge
        variant="outline"
        className="bg-destructive/8 text-destructive border-destructive/20"
      >
        Sin stock
      </Badge>
    );
  }
  if (status === "bajo") {
    return (
      <Badge
        variant="outline"
        className="bg-warning/12 text-warning border-warning/25"
      >
        Bajo stock · {actual}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-success/10 text-success border-success/20"
    >
      {actual} unidades
    </Badge>
  );
}

/**
 * Card de producto en el catálogo Maxsex.
 * Server Component: el hover se resuelve con CSS, no JS.
 */
export function ProductCard(props: ProductCardProps) {
  const {
    slug,
    linea,
    color_hex,
    audiencia,
    beneficios,
    descripcion_corta,
    precio,
    stock_actual,
    stock_minimo,
    destacado,
  } = props;

  const AudienciaIcon = AUDIENCIA_ICON[audiencia];

  return (
    <Link
      href={`/maxsex/${slug}`}
      className="group/maxsex-card focus-visible:outline-none"
      aria-label={`Ver ficha de ${MAXSEX_LINEA_LABEL[linea]}`}
    >
      <Card
        interactive
        size="sm"
        className="relative h-full overflow-hidden"
        style={
          {
            "--line": color_hex,
          } as React.CSSProperties
        }
      >
        {/* Strip vertical color de línea */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] z-10"
          style={{ background: color_hex }}
        />

        {/* Tinte radial sutil que se enciende en hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/maxsex-card:opacity-100"
          style={{
            background: `radial-gradient(120% 70% at 0% 0%, color-mix(in oklch, ${color_hex} 14%, transparent) 0%, transparent 60%)`,
          }}
        />

        {/* Glow ring sutil al hover usando el color de la línea */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-transparent transition-all duration-300 group-hover/maxsex-card:ring-[color:var(--line)]/30"
        />

        <div className="relative flex h-full flex-col gap-3.5 px-4 pb-4 pl-5">
          {/* Eyebrow + flecha de ingreso */}
          <header className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.22em]">
                Maxsex
              </p>
              <h3
                className="font-heading text-[26px] font-bold leading-none tracking-tight"
                style={{ color: color_hex }}
              >
                {MAXSEX_LINEA_LABEL[linea]}
              </h3>
              <p className="text-muted-foreground text-xs font-medium">
                {MAXSEX_LINEA_KICKER[linea]}
              </p>
            </div>
            <ArrowUpRight
              className="text-muted-foreground/50 size-4 shrink-0 translate-y-0 translate-x-0 transition-transform duration-300 group-hover/maxsex-card:-translate-y-0.5 group-hover/maxsex-card:translate-x-0.5"
              style={{ color: color_hex, opacity: 0.55 }}
              aria-hidden
            />
          </header>

          {/* Caja del producto (placeholder visual) */}
          <ProductBox
            linea={linea}
            lineaLabel={MAXSEX_LINEA_LABEL[linea]}
            colorHex={color_hex}
            size="md"
          />

          {/* Beneficios como chips */}
          <ul className="flex flex-wrap gap-1.5">
            {beneficios.map((b) => (
              <li
                key={b}
                className="text-[11px] font-medium rounded-full border px-2 py-0.5"
                style={{
                  color: color_hex,
                  background: `color-mix(in oklch, ${color_hex} 6%, transparent)`,
                  borderColor: `color-mix(in oklch, ${color_hex} 22%, transparent)`,
                }}
              >
                {b}
              </li>
            ))}
          </ul>

          {/* Descripción */}
          <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-3">
            {descripcion_corta}
          </p>

          {/* Footer: audiencia + precio + stock */}
          <footer className="border-foreground/8 mt-auto flex items-end justify-between gap-3 border-t pt-3">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide">
                Precio sugerido
              </p>
              <p className="font-heading text-lg font-semibold tabular-nums leading-none">
                {formatARS(precio)}
              </p>
              <p className="text-muted-foreground mt-1.5 inline-flex items-center gap-1 text-[11px]">
                <AudienciaIcon
                  aria-hidden
                  className="size-3"
                  style={{ color: color_hex }}
                />
                <span>{MAXSEX_AUDIENCIA_LABEL[audiencia]}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {destacado && (
                <Badge
                  variant="outline"
                  className={cn(
                    "border-foreground/15 bg-card text-foreground gap-1",
                  )}
                >
                  <Sparkles aria-hidden className="size-2.5" />
                  Destacado
                </Badge>
              )}
              <StockBadge actual={stock_actual} minimo={stock_minimo} />
            </div>
          </footer>
        </div>
      </Card>
    </Link>
  );
}
