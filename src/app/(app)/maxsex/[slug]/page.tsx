import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Stethoscope,
  Leaf,
  Pill,
  ShieldAlert,
  Mars,
  Venus,
  PackageCheck,
  BadgeCheck,
} from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getProductBySlug } from "@/lib/data/maxsex";
import {
  MAXSEX_AUDIENCIA_LABEL,
  MAXSEX_LINEA_KICKER,
  MAXSEX_LINEA_LABEL,
  formatARS,
  stockStatus,
  type MaxsexAudiencia,
} from "@/lib/validation/maxsex";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProductBox } from "@/components/maxsex/product-box";
import { InfoSection } from "@/components/maxsex/info-section";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Producto no encontrado · Maxsex" };
  return {
    title: `${p.nombre_corto} · Maxsex`,
    description: p.descripcion_corta,
  };
}

const AUDIENCIA_ICON: Record<MaxsexAudiencia, typeof Mars> = {
  hombre: Mars,
  mujer: Venus,
  unisex: Sparkles,
};

export default async function MaxsexProductPage({ params }: PageProps) {
  await requireRole([
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
    ROLES.asesor,
    ROLES.comercial,
    ROLES.marketing,
  ]);

  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const color = product.color_hex;
  const AudienciaIcon = AUDIENCIA_ICON[product.audiencia];
  const stockSt = stockStatus(product.stock_actual, product.stock_minimo);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Reveal>
        <Link
          href="/maxsex"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Volver al catálogo
        </Link>
      </Reveal>

      {/* HERO */}
      <Reveal delay={0.04}>
        <Card
          className="relative overflow-hidden p-0"
          style={
            {
              "--line": color,
            } as React.CSSProperties
          }
        >
          {/* Strip vertical color de línea */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[3px]"
            style={{ background: color }}
          />
          {/* Tinte radial muy sutil */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(80% 60% at 0% 0%, color-mix(in oklch, ${color} 8%, transparent) 0%, transparent 60%)`,
            }}
          />

          <div className="relative grid gap-6 p-6 pl-7 md:grid-cols-[minmax(0,260px)_1fr] md:gap-8 md:p-8 md:pl-9">
            {/* Caja del producto */}
            <ProductBox
              linea={product.linea}
              lineaLabel={MAXSEX_LINEA_LABEL[product.linea]}
              colorHex={color}
              presentacion={product.presentacion.toUpperCase()}
              size="lg"
              className="self-start shadow-md"
            />

            {/* Datos clave */}
            <div className="space-y-5">
              <header className="space-y-1.5">
                <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.22em]">
                  Maxsex
                </p>
                <h1
                  className="font-heading text-5xl font-bold leading-none tracking-tight"
                  style={{ color }}
                >
                  {MAXSEX_LINEA_LABEL[product.linea]}
                </h1>
                <p className="text-foreground/80 text-sm font-medium">
                  {MAXSEX_LINEA_KICKER[product.linea]} ·{" "}
                  <span className="text-muted-foreground">
                    {product.tagline}
                  </span>
                </p>
              </header>

              {/* Beneficios */}
              <ul className="flex flex-wrap gap-1.5">
                {product.beneficios.map((b) => (
                  <li
                    key={b}
                    className="rounded-full border px-2.5 py-1 text-[12px] font-medium"
                    style={{
                      color,
                      background: `color-mix(in oklch, ${color} 7%, transparent)`,
                      borderColor: `color-mix(in oklch, ${color} 24%, transparent)`,
                    }}
                  >
                    {b}
                  </li>
                ))}
              </ul>

              {/* Descripción */}
              {product.descripcion_larga && (
                <p className="text-foreground/80 text-[15px] leading-relaxed">
                  {product.descripcion_larga}
                </p>
              )}

              {/* Meta row: audiencia · presentación · RNPA */}
              <dl className="text-muted-foreground border-foreground/8 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-[12px]">
                <div className="inline-flex items-center gap-1.5">
                  <AudienciaIcon
                    aria-hidden
                    className="size-3.5"
                    style={{ color }}
                  />
                  <dt className="sr-only">Audiencia</dt>
                  <dd>{MAXSEX_AUDIENCIA_LABEL[product.audiencia]}</dd>
                </div>
                <div className="inline-flex items-center gap-1.5">
                  <PackageCheck
                    aria-hidden
                    className="size-3.5"
                    style={{ color }}
                  />
                  <dt className="sr-only">Presentación</dt>
                  <dd>{product.presentacion}</dd>
                </div>
                {product.sku && (
                  <div className="inline-flex items-center gap-1.5">
                    <dt className="sr-only">SKU</dt>
                    <dd className="font-mono text-[11px]">
                      SKU · {product.sku}
                    </dd>
                  </div>
                )}
                {product.rnpa && (
                  <div className="inline-flex items-center gap-1.5">
                    <BadgeCheck
                      aria-hidden
                      className="size-3.5"
                      style={{ color }}
                    />
                    <dt className="sr-only">RNPA</dt>
                    <dd>RNPA {product.rnpa}</dd>
                  </div>
                )}
              </dl>

              {/* Precio + Stock */}
              <div className="ring-foreground/8 flex flex-wrap items-end justify-between gap-3 rounded-lg px-4 py-3 ring-1">
                <div>
                  <p className="text-muted-foreground text-[11px] uppercase tracking-wider">
                    Precio sugerido
                  </p>
                  <p className="font-heading text-3xl font-semibold tabular-nums leading-none">
                    {formatARS(Number(product.precio))}
                  </p>
                  {product.precio_promo !== null && (
                    <p className="text-success mt-0.5 text-xs font-medium">
                      Promo: {formatARS(Number(product.precio_promo))}
                    </p>
                  )}
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-muted-foreground text-[11px] uppercase tracking-wider">
                    Stock
                  </p>
                  <Badge
                    variant="outline"
                    className={
                      stockSt === "sin_stock"
                        ? "bg-destructive/8 text-destructive border-destructive/20"
                        : stockSt === "bajo"
                          ? "bg-warning/12 text-warning border-warning/25"
                          : "bg-success/10 text-success border-success/20"
                    }
                  >
                    {stockSt === "sin_stock"
                      ? "Sin stock"
                      : stockSt === "bajo"
                        ? `Bajo stock · ${product.stock_actual}`
                        : `${product.stock_actual} unidades`}
                  </Badge>
                  <p className="text-muted-foreground text-[11px]">
                    Mínimo: {product.stock_minimo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* INFO SECTIONS */}
      <Stagger className="grid gap-4 md:grid-cols-2">
        <StaggerItem>
          <InfoSection
            icon={Stethoscope}
            title={product.indicacion_titulo ?? "Indicación clínica"}
            body={product.indicacion_descripcion}
            accent={color}
          />
        </StaggerItem>
        <StaggerItem>
          <InfoSection
            icon={Leaf}
            title="Composición"
            body={product.composicion}
            accent={color}
          />
        </StaggerItem>
        <StaggerItem>
          <InfoSection
            icon={Pill}
            title="Modo de uso"
            body={product.modo_uso}
            accent={color}
          />
        </StaggerItem>
        {product.advertencias && (
          <StaggerItem>
            <Card size="sm" className="bg-warning/8 border-warning/30 p-5">
              <div className="flex items-start gap-3">
                <div className="bg-warning/15 ring-warning/30 grid size-9 place-items-center rounded-lg ring-1">
                  <ShieldAlert className="text-warning size-4" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-warning text-[13px] font-semibold uppercase tracking-tight">
                    Advertencias
                  </h3>
                  <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
                    {product.advertencias}
                  </p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        )}
      </Stagger>

      {/* DISCLAIMER */}
      <Reveal delay={0.1}>
        <p className="text-muted-foreground text-center text-[11px] leading-relaxed">
          Este producto es un suplemento dietario. No reemplaza una alimentación
          variada ni el tratamiento médico. Consultar a un profesional de la
          salud antes de iniciar la suplementación.
        </p>
      </Reveal>
    </div>
  );
}
