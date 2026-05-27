import type { Metadata } from "next";
import { Receipt, Truck, Wallet } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatARS, PLAN_ESTADO_LABEL } from "@/lib/validation/commercial";
import { RegisterPaymentDialog } from "@/components/commercial/register-payment-dialog";
import { PLAN_ESTADO_STYLE } from "@/lib/ui/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Comercial · paciente" };

export default async function PatientCommercialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole([ROLES.owner, ROLES.admin, ROLES.comercial]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: plansRaw } = await supabase
    .from("treatment_plans")
    .select(
      "id, descripcion, costo_total, cant_aplicaciones, estado, inicio, product:products(codigo), payments(importe, fecha)",
    )
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select(
      "id, fecha, cantidad, detalle, inventory_item:inventory_items(nombre)",
    )
    .eq("patient_id", id)
    .order("fecha", { ascending: false });

  const plans = (plansRaw ?? []).map((p) => {
    const pays = (p.payments ?? []) as { importe: number }[];
    const pagado = pays.reduce((s, x) => s + Number(x.importe), 0);
    const costo = Number(p.costo_total);
    return { ...p, pagado, saldo: costo - pagado, costo_total: costo };
  });

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Wallet className="text-muted-foreground size-4" />
          Planes de tratamiento ({plans.length})
        </h2>
        {plans.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Sin planes asociados"
            description="Creá un plan desde Comercial para registrar pagos y entregas vinculadas a este paciente."
          />
        ) : (
          <div className="space-y-3">
            {plans.map((p) => {
              const pct =
                p.costo_total > 0
                  ? Math.min(100, Math.round((p.pagado / p.costo_total) * 100))
                  : 0;
              const productLabel = (p.product as { codigo: string } | null)
                ?.codigo;
              return (
                <Card key={p.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {p.descripcion ?? "Plan de tratamiento"}
                        {productLabel && (
                          <span className="text-muted-foreground">
                            {" "}· {productLabel}
                          </span>
                        )}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {p.cant_aplicaciones} aplicaciones · inicio{" "}
                        {p.inicio ?? "—"}
                      </p>
                      <div className="bg-muted mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            pct >= 100
                              ? "bg-success"
                              : p.saldo > 0
                                ? "bg-primary"
                                : "bg-success",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {formatARS(p.pagado)} / {formatARS(p.costo_total)}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          p.saldo > 0 ? "text-destructive" : "text-success",
                        )}
                      >
                        Saldo {formatARS(p.saldo)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        PLAN_ESTADO_STYLE[
                          p.estado as keyof typeof PLAN_ESTADO_STYLE
                        ] ?? "",
                      )}
                    >
                      {PLAN_ESTADO_LABEL[p.estado]}
                    </Badge>
                    <RegisterPaymentDialog
                      planId={p.id}
                      patientId={id}
                      saldo={p.saldo}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Truck className="text-muted-foreground size-4" />
          Entregas ({deliveries?.length ?? 0})
        </h2>
        {!deliveries || deliveries.length === 0 ? (
          <Card className="text-muted-foreground p-6 text-center text-sm">
            Sin entregas registradas para este paciente.
          </Card>
        ) : (
          <Card className="p-0">
            <ul className="divide-y">
              {deliveries.map((d) => {
                const invRaw = d.inventory_item as
                  | { nombre: string }
                  | { nombre: string }[]
                  | null;
                const invName = Array.isArray(invRaw)
                  ? invRaw[0]?.nombre
                  : invRaw?.nombre;
                return (
                  <li
                    key={d.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-lg">
                      <Truck className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {invName ?? "Entrega"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {d.detalle ?? "—"} · {d.cantidad} u.
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {d.fecha}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
