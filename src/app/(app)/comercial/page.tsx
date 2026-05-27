import type { Metadata } from "next";
import Link from "next/link";
import { Wallet, Package, Truck, Bell, Boxes } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import {
  listPlansWithSaldo,
  listProducts,
  commercialTotals,
} from "@/lib/data/commercial";
import {
  listDeliveries,
  listInventory,
  listFollowUps,
  operationsTotals,
} from "@/lib/data/operations";
import { listPatients } from "@/lib/data/patients";
import { formatARS, PLAN_ESTADO_LABEL } from "@/lib/validation/commercial";
import {
  FOLLOWUP_TIPO_LABEL,
  FOLLOWUP_ESTADO_LABEL,
} from "@/lib/validation/operations";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiRow } from "@/components/ui/kpi-row";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/motion/reveal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PLAN_ESTADO_STYLE,
  FOLLOWUP_ESTADO_STYLE,
} from "@/lib/ui/status";
import { RegisterPaymentDialog } from "@/components/commercial/register-payment-dialog";
import {
  NewProductDialog,
  NewPlanDialog,
} from "@/components/commercial/commercial-dialogs";
import {
  RegisterDeliveryDialog,
  NewInventoryDialog,
  AdjustStockDialog,
  CompleteFollowUpButton,
  ScheduleFollowUpsButton,
} from "@/components/commercial/operations-dialogs";

export const metadata: Metadata = { title: "Comercial" };

const TABS = [
  { id: "planes", label: "Planes", icon: Wallet },
  { id: "entregas", label: "Entregas", icon: Truck },
  { id: "stock", label: "Stock", icon: Boxes },
  { id: "seguimientos", label: "Seguimientos", icon: Bell },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default async function ComercialPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireRole([ROLES.owner, ROLES.admin, ROLES.comercial]);
  const { tab: tabParam } = await searchParams;
  const tab: Tab = (TABS.find((t) => t.id === tabParam)?.id ??
    "planes") as Tab;

  const [
    totals,
    opTotals,
    plans,
    products,
    patients,
    deliveries,
    inventory,
    followUps,
  ] = await Promise.all([
    commercialTotals(),
    operationsTotals(),
    listPlansWithSaldo(),
    listProducts(),
    listPatients({ limit: 50 }),
    listDeliveries(),
    listInventory(),
    listFollowUps(),
  ]);

  const patientOpts = patients.map((p) => ({
    id: p.id,
    label: `${p.apellido}, ${p.nombres}${p.dni ? ` · ${p.dni}` : ""}`,
  }));
  const productOpts = products.map((p) => ({
    id: p.id,
    label: `${p.codigo} — ${formatARS(Number(p.precio))}`,
    precio: Number(p.precio),
  }));
  const invOpts = inventory.map((i) => ({
    id: i.id,
    label: `${i.nombre} (stock ${i.stock})`,
  }));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <PageHeader
        eyebrow={
          <>
            <Wallet className="size-3" />
            Gestión comercial
          </>
        }
        title="Comercial · FIC"
        description="Productos, planes, cobranzas, entregas, stock y adherencia."
        size="lg"
        actions={
          <>
            <NewProductDialog />
            <NewPlanDialog patients={patientOpts} products={productOpts} />
          </>
        }
      />

      <KpiRow
        items={[
          {
            label: "Facturado",
            value: totals.facturado,
            icon: "wallet",
            accent: "var(--chart-2)",
            money: true,
            hint: `${plans.length} planes`,
          },
          {
            label: "Cobrado",
            value: totals.cobrado,
            icon: "trending",
            accent: "var(--success)",
            money: true,
          },
          {
            label: "Saldo pendiente",
            value: totals.saldo,
            icon: "coins",
            accent: "var(--destructive)",
            money: true,
            hint: "por cobrar",
          },
          {
            label: "Seguim. vencidos",
            value: opTotals.seguimientosVencidos,
            icon: "alert",
            accent: "var(--warning)",
            hint: `${opTotals.seguimientosPendientes} pendientes`,
          },
        ]}
      />

      <Tabs value={tab} className="overflow-x-auto">
        <TabsList variant="line" className="w-fit">
          {TABS.map((tt) => (
            <TabsTrigger
              key={tt.id}
              value={tt.id}
              render={<Link href={`/comercial?tab=${tt.id}`} />}
            >
              <tt.icon className="size-4" />
              {tt.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === "planes" && (
        <Reveal delay={0.04} className="space-y-5">
          {products.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <Card key={p.id} className="hairline-top p-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
                      <Package className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {p.codigo}
                      </p>
                      <p className="text-muted-foreground truncate text-[11px]">
                        {p.aplicaciones} aplicaciones
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums">
                    {formatARS(Number(p.precio))}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {plans.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Sin planes de tratamiento"
              description="Creá el primer plan FIC para un paciente y registrá sus pagos y entregas."
              action={
                <NewPlanDialog
                  patients={patientOpts}
                  products={productOpts}
                />
              }
            />
          ) : (
            <Card className="p-0">
              <div className="text-muted-foreground flex items-center justify-between px-5 py-3 text-xs font-medium">
                <span>{plans.length} planes</span>
                <span>cobrado / total</span>
              </div>
              <ul className="border-t">
                {plans.map((pl) => {
                  const pct =
                    pl.costo_total > 0
                      ? Math.min(
                          100,
                          Math.round((pl.pagado / pl.costo_total) * 100),
                        )
                      : 0;
                  return (
                    <li
                      key={pl.id}
                      className="hover:bg-accent/30 flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {pl.patient
                            ? `${pl.patient.apellido}, ${pl.patient.nombres}`
                            : "Paciente"}
                          {pl.product && (
                            <span className="text-muted-foreground">
                              {" "}
                              · {pl.product.codigo}
                            </span>
                          )}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {pl.descripcion ?? "Plan de tratamiento"} ·{" "}
                          {pl.cant_aplicaciones} aplic.
                        </p>
                        <div className="bg-muted mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              pct >= 100
                                ? "bg-success"
                                : pl.saldo > 0
                                  ? "bg-primary"
                                  : "bg-success",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs tabular-nums">
                          {formatARS(pl.pagado)} /{" "}
                          {formatARS(pl.costo_total)}
                        </p>
                        <p
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            pl.saldo > 0
                              ? "text-destructive"
                              : "text-success",
                          )}
                        >
                          Saldo {formatARS(pl.saldo)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          PLAN_ESTADO_STYLE[
                            pl.estado as keyof typeof PLAN_ESTADO_STYLE
                          ] ?? ""
                        }
                      >
                        {PLAN_ESTADO_LABEL[pl.estado]}
                      </Badge>
                      <ScheduleFollowUpsButton planId={pl.id} />
                      <RegisterPaymentDialog
                        planId={pl.id}
                        patientId={pl.patient_id}
                        saldo={pl.saldo}
                      />
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </Reveal>
      )}

      {tab === "entregas" && (
        <Reveal delay={0.04} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Truck className="text-muted-foreground size-4" />
              Entregas ({deliveries.length})
            </h2>
            <RegisterDeliveryDialog
              patients={patientOpts}
              inventory={invOpts}
            />
          </div>
          {deliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="Sin entregas registradas"
              description="Cada retiro de aplicación FIC queda asentado acá, descontando stock."
            />
          ) : (
            <Card className="p-0">
              <ul className="divide-y">
                {deliveries.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <span className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg">
                      <Truck className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {d.patient
                          ? `${d.patient.apellido}, ${d.patient.nombres}`
                          : "Paciente"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {d.detalle ?? "Entrega"} · {d.cantidad} u.
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {d.fecha}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Reveal>
      )}

      {tab === "stock" && (
        <Reveal delay={0.04} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Boxes className="text-muted-foreground size-4" />
              Stock ({inventory.length})
              {opTotals.stockBajo > 0 && (
                <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-[11px] font-medium">
                  {opTotals.stockBajo} bajo mínimo
                </span>
              )}
            </h2>
            <NewInventoryDialog />
          </div>
          {inventory.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="Sin ítems de stock"
              description="Cargá insumos (ampollas FIC, agujas…) para controlar existencias y mínimos."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((i) => (
                <Card
                  key={i.id}
                  className={cn(
                    "hairline-top p-4",
                    i.low && "ring-destructive/25",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{i.nombre}</p>
                      <p className="text-muted-foreground text-xs">
                        mín. {i.minimo} {i.unidad}
                      </p>
                    </div>
                    {i.low && (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                        Bajo
                      </Badge>
                    )}
                  </div>
                  <p className="mt-3 text-2xl font-semibold tabular-nums">
                    {i.stock}
                    <span className="text-muted-foreground ml-1 text-xs font-normal">
                      {i.unidad}
                    </span>
                  </p>
                  <div className="mt-2">
                    <AdjustStockDialog itemId={i.id} nombre={i.nombre} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Reveal>
      )}

      {tab === "seguimientos" && (
        <Reveal delay={0.04} className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="text-muted-foreground size-4" />
            Seguimientos ({followUps.length}) ·{" "}
            {opTotals.seguimientosPendientes} pendientes
          </h2>
          {followUps.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Sin seguimientos"
              description="Se generan con «Agendar 15/30/60» desde un plan de tratamiento."
            />
          ) : (
            <Card className="p-0">
              <ul className="divide-y">
                {followUps.map((f) => {
                  const overdue =
                    f.estado === "pendiente" && f.due_date < today;
                  return (
                    <li
                      key={f.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5"
                    >
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          overdue
                            ? "bg-destructive"
                            : f.estado === "hecho"
                              ? "bg-success"
                              : "bg-warning",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {f.patient
                            ? `${f.patient.apellido}, ${f.patient.nombres}`
                            : "Paciente"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {FOLLOWUP_TIPO_LABEL[f.tipo]}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          overdue
                            ? "text-destructive font-medium"
                            : "text-muted-foreground",
                        )}
                      >
                        {f.due_date}
                        {overdue && " · vencido"}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          FOLLOWUP_ESTADO_STYLE[
                            f.estado as keyof typeof FOLLOWUP_ESTADO_STYLE
                          ] ?? ""
                        }
                      >
                        {FOLLOWUP_ESTADO_LABEL[f.estado]}
                      </Badge>
                      {f.estado === "pendiente" && (
                        <CompleteFollowUpButton id={f.id} />
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </Reveal>
      )}
    </div>
  );
}
