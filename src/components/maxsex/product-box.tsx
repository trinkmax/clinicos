import { cn } from "@/lib/utils";

import type { MaxsexLinea } from "@/lib/validation/maxsex";

interface ProductBoxProps {
  linea: MaxsexLinea;
  lineaLabel: string;
  colorHex: string;
  presentacion?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TEXT_BY_SIZE = {
  sm: { kicker: "text-[8px]", linea: "text-base", presentacion: "text-[8px]" },
  md: {
    kicker: "text-[9px]",
    linea: "text-xl",
    presentacion: "text-[9px]",
  },
  lg: {
    kicker: "text-[11px]",
    linea: "text-4xl",
    presentacion: "text-[10px]",
  },
} satisfies Record<
  NonNullable<ProductBoxProps["size"]>,
  Record<"kicker" | "linea" | "presentacion", string>
>;

/**
 * Mock-up estilizado de la caja del producto. Reemplaza la foto del folleto con
 * una composición CSS que respeta el branding de cada línea (color + jerarquía).
 * Cuando lleguen las fotos reales, este componente se sustituye por un <Image>.
 */
export function ProductBox({
  lineaLabel,
  colorHex,
  presentacion = "30 CÁPSULAS",
  size = "md",
  className,
}: ProductBoxProps) {
  const t = TEXT_BY_SIZE[size];

  return (
    <div
      aria-hidden
      className={cn(
        "relative isolate flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-lg text-white",
        size === "sm" && "p-2",
        size === "md" && "p-3",
        size === "lg" && "p-5",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${colorHex} 0%, color-mix(in oklch, ${colorHex} 80%, black) 100%)`,
      }}
    >
      {/* Luz de marca en la esquina superior izquierda */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-25"
        style={{
          background:
            "radial-gradient(circle at 30% 18%, white 0%, transparent 55%)",
        }}
      />

      {/* Trama sutil (impresión litográfica) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-overlay opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, white 0 1px, transparent 1px 4px)",
        }}
      />

      {/* Logo MAXSEX + línea */}
      <div className="space-y-0.5">
        <p
          className={cn(
            "font-semibold uppercase tracking-[0.22em] opacity-80",
            t.kicker,
          )}
        >
          MAXSEX
        </p>
        <p
          className={cn(
            "font-extrabold tracking-tight leading-none",
            t.linea,
          )}
        >
          {lineaLabel.toUpperCase()}
        </p>
        {size !== "sm" && (
          <p
            className={cn(
              "uppercase tracking-[0.18em] opacity-70",
              t.kicker,
            )}
          >
            Potencia tu intimidad
          </p>
        )}
      </div>

      {/* Pie: cantidad */}
      <div
        className={cn(
          "flex items-end justify-between",
          t.presentacion,
        )}
      >
        <span className="opacity-80 uppercase tracking-[0.18em]">
          Control Group
        </span>
        <span className="rounded border border-white/40 px-1.5 py-0.5 font-semibold uppercase tracking-wider">
          {presentacion}
        </span>
      </div>
    </div>
  );
}
