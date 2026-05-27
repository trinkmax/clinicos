import type { Metadata } from "next";
import { Layers, Sparkles, Pill, AlertTriangle, Wallet } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listProducts, maxsexOverview } from "@/lib/data/maxsex";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiRow } from "@/components/ui/kpi-row";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProductCard } from "@/components/maxsex/product-card";
import { LineStrip } from "@/components/maxsex/line-strip";

export const metadata: Metadata = {
  title: "Maxsex · Catálogo",
  description:
    "Línea OTC de suplementos Maxsex. Catálogo interno, source-of-truth para el e-commerce.",
};

export default async function MaxsexPage() {
  await requireRole([
    ROLES.owner,
    ROLES.admin,
    ROLES.recepcion,
    ROLES.profesional,
    ROLES.asesor,
    ROLES.comercial,
    ROLES.marketing,
  ]);

  const [products, overview] = await Promise.all([
    listProducts(),
    maxsexOverview(),
  ]);

  const lineChips = products.map((p) => ({
    linea: p.linea,
    color_hex: p.color_hex,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7">
      <PageHeader
        eyebrow={
          <>
            <Pill className="size-3" />
            Línea OTC · Suplementos
          </>
        }
        title="Maxsex"
        description="Cinco fórmulas para sostener la intimidad. Catálogo interno; las ediciones se sincronizan con el e-commerce."
        size="lg"
      />

      {products.length > 0 && (
        <Reveal delay={0.04}>
          <LineStrip lineas={lineChips} />
        </Reveal>
      )}

      <KpiRow
        items={[
          {
            label: "Productos activos",
            value: `${overview.productos_activos} / ${overview.productos_totales}`,
            icon: "package",
            accent: "var(--primary)",
            hint: `${overview.lineas_activas} líneas en catálogo`,
          },
          {
            label: "Unidades en stock",
            value: overview.stock_total,
            icon: "boxes",
            accent: "var(--success)",
          },
          {
            label: "Valor de inventario",
            value: overview.valor_inventario,
            icon: "coins",
            money: true,
            accent: "var(--chart-3)",
          },
          {
            label: "Bajo stock",
            value: overview.productos_bajo_stock,
            icon: "alert",
            accent: overview.productos_bajo_stock > 0
              ? "var(--warning)"
              : "var(--muted-foreground)",
            hint:
              overview.productos_bajo_stock > 0
                ? "Reponer en próxima compra"
                : "Inventario saludable",
          },
        ]}
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Sin productos cargados"
          description="El catálogo Maxsex está vacío. Cargá la primera línea de suplementos para empezar a vender."
          className="py-16"
        />
      ) : (
        <section className="space-y-3">
          <h2 className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium tracking-tight">
            <Layers className="size-4" />
            Catálogo
            <span className="text-muted-foreground/60">
              · {products.length} productos
            </span>
          </h2>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard
                  slug={p.slug}
                  linea={p.linea}
                  nombre_corto={p.nombre_corto}
                  color_hex={p.color_hex}
                  audiencia={p.audiencia}
                  beneficios={p.beneficios}
                  descripcion_corta={p.descripcion_corta}
                  precio={Number(p.precio)}
                  stock_actual={p.stock_actual}
                  stock_minimo={p.stock_minimo}
                  destacado={p.destacado}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <Reveal delay={0.08}>
        <div className="ring-foreground/8 bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="text-warning size-4 shrink-0" />
            <p className="text-muted-foreground text-[13px] leading-relaxed">
              Los precios son sugeridos. El e-commerce gestiona impuestos, envíos
              y promociones desde su propio backend.
            </p>
          </div>
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
            <Wallet className="size-3" />
            ARS
          </p>
        </div>
      </Reveal>
    </div>
  );
}
