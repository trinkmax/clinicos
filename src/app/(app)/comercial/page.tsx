import type { Metadata } from "next";
import Link from "next/link";
import { Wallet, AlertTriangle } from "lucide-react";

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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const ESTADO_STYLE: Record<string, string> = {
  activo: "bg-success/12 text-success border-success/20",
  completado: "bg-info/12 text-info border-info/20",
  en_mora: "bg-destructive/10 text-destructive border-destructive/20",
  cancelado: "bg-muted text-muted-foreground",
};
const TABS = [
  { id: "planes", label: "Planes" },
  { id: "entregas", label: "Entregas" },
  { id: "stock", label: "Stock" },
  { id: "seguimientos", label: "Seguimientos" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <Icon className="size-4" />
        {label}
      </div>
      <p
        className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${accent ? "text-destructive" : ""}`}
      >
        {value}
      </p>
    </Card>
  );
}

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
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Comercial</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Productos, planes, pagos, entregas, stock y seguimiento
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Facturado" value={formatARS(totals.facturado)} />
        <Kpi icon={Wallet} label="Cobrado" value={formatARS(totals.cobrado)} />
        <Kpi
          icon={Wallet}
          label="Saldo pendiente"
          value={formatARS(totals.saldo)}
          accent={totals.saldo > 0}
        />
        <Kpi
          icon={AlertTriangle}
          label="Seguim. vencidos"
          value={String(opTotals.seguimientosVencidos)}
          accent={opTotals.seguimientosVencidos > 0}
        />
      </section>

      <nav className="flex gap-1 border-b">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/comercial?tab=${t.id}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "planes" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Planes ({plans.length})
            </h2>
            <div className="flex gap-2">
              <NewProductDialog />
              <NewPlanDialog patients={patientOpts} products={productOpts} />
            </div>
          </div>
          {products.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {products.map((p) => (
                <Card key={p.id} className="p-4">
                  <p className="font-semibold">{p.codigo}</p>
                  <p className="text-muted-foreground text-xs">{p.nombre}</p>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    {formatARS(Number(p.precio))}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {p.aplicaciones} aplicaciones
                  </p>
                </Card>
              ))}
            </div>
          )}
          {plans.length === 0 ? (
            <Card className="text-muted-foreground p-10 text-center text-sm">
              Sin planes. Creá uno con «Nuevo plan».
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <ul className="divide-y">
                {plans.map((pl) => (
                  <li
                    key={pl.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4"
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
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">
                        {formatARS(pl.pagado)} / {formatARS(pl.costo_total)}
                      </p>
                      <p
                        className={`text-sm font-semibold tabular-nums ${pl.saldo > 0 ? "text-destructive" : "text-success"}`}
                      >
                        Saldo {formatARS(pl.saldo)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={ESTADO_STYLE[pl.estado] ?? ""}
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
                ))}
              </ul>
            </Card>
          )}
        </section>
      )}

      {tab === "entregas" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Entregas ({deliveries.length})
            </h2>
            <RegisterDeliveryDialog
              patients={patientOpts}
              inventory={invOpts}
            />
          </div>
          {deliveries.length === 0 ? (
            <Card className="text-muted-foreground p-10 text-center text-sm">
              Sin entregas registradas.
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <ul className="divide-y">
                {deliveries.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
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
        </section>
      )}

      {tab === "stock" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Stock ({inventory.length}) ·{" "}
              <span
                className={
                  opTotals.stockBajo > 0 ? "text-destructive" : ""
                }
              >
                {opTotals.stockBajo} bajo mínimo
              </span>
            </h2>
            <NewInventoryDialog />
          </div>
          {inventory.length === 0 ? (
            <Card className="text-muted-foreground p-10 text-center text-sm">
              Sin ítems de stock.
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((i) => (
                <Card key={i.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{i.nombre}</p>
                      <p className="text-muted-foreground text-xs">
                        mín. {i.minimo} {i.unidad}
                      </p>
                    </div>
                    {i.low && (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                        <AlertTriangle className="size-3" />
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
        </section>
      )}

      {tab === "seguimientos" && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">
            Seguimientos ({followUps.length}) · {opTotals.seguimientosPendientes}{" "}
            pendientes
          </h2>
          {followUps.length === 0 ? (
            <Card className="text-muted-foreground p-10 text-center text-sm">
              Sin seguimientos. Se generan con «Agendar 15/30/60» desde un
              plan.
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <ul className="divide-y">
                {followUps.map((f) => {
                  const overdue =
                    f.estado === "pendiente" && f.due_date < today;
                  return (
                    <li
                      key={f.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5"
                    >
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
                        className={`text-xs tabular-nums ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}
                      >
                        {f.due_date}
                        {overdue && " · vencido"}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          f.estado === "hecho"
                            ? "bg-success/12 text-success border-success/20"
                            : f.estado === "pendiente"
                              ? "bg-warning/15 text-warning-foreground border-warning/30"
                              : "bg-muted text-muted-foreground"
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
        </section>
      )}
    </div>
  );
}
