"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Truck,
  Boxes,
  SlidersHorizontal,
  CalendarClock,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import {
  registerDelivery,
  createInventoryItem,
  adjustStock,
  completeFollowUp,
  scheduleFollowUps,
} from "@/lib/actions/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const selectCls =
  "border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2";

function useAct() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    okMsg: string,
    onOk?: () => void,
  ) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast.success(okMsg);
        onOk?.();
        router.refresh();
      } else toast.error(r.error ?? "Error");
    });
  return { pending, run };
}

export function RegisterDeliveryDialog({
  patients,
  inventory,
}: {
  patients: { id: string; label: string }[];
  inventory: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAct();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Truck className="size-3.5" />
            Registrar entrega
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar entrega</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) =>
            run(
              () => registerDelivery(Object.fromEntries(fd)),
              "Entrega registrada",
              () => setOpen(false),
            )
          }
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="patient_id">Paciente</Label>
            <select id="patient_id" name="patient_id" className={selectCls} required>
              <option value="">Elegí…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input id="cantidad" name="cantidad" type="number" min={1} defaultValue={1} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="detalle">Detalle</Label>
            <Input id="detalle" name="detalle" placeholder="Aplicaciones / otros" />
          </div>
          {inventory.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="descontar_stock_item_id">
                Descontar de stock (opcional)
              </Label>
              <select
                id="descontar_stock_item_id"
                name="descontar_stock_item_id"
                className={selectCls}
              >
                <option value="">No descontar</option>
                {inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewInventoryDialog() {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAct();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Boxes className="size-3.5" />
            Nuevo ítem
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo ítem de stock</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) =>
            run(
              () => createInventoryItem(Object.fromEntries(fd)),
              "Ítem creado",
              () => setOpen(false),
            )
          }
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: ampollas, insumo"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="unidad">Unidad</Label>
              <Input id="unidad" name="unidad" defaultValue="aplicación" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" min={0} defaultValue={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minimo">Mínimo</Label>
              <Input id="minimo" name="minimo" type="number" min={0} defaultValue={0} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdjustStockDialog({
  itemId,
  nombre,
}: {
  itemId: string;
  nombre: string;
}) {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAct();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="ghost">
            <SlidersHorizontal className="size-3.5" />
            Ajustar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Ajustar stock · {nombre}</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) => {
            fd.set("item_id", itemId);
            run(
              () => adjustStock(Object.fromEntries(fd)),
              "Stock actualizado",
              () => setOpen(false),
            );
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Movimiento</Label>
            <select id="tipo" name="tipo" className={selectCls} defaultValue="entrada">
              <option value="entrada">Entrada (+)</option>
              <option value="salida">Salida (−)</option>
              <option value="ajuste">Ajuste (= valor absoluto)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input id="cantidad" name="cantidad" type="number" min={1} step="any" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="motivo">Motivo</Label>
            <Input id="motivo" name="motivo" placeholder="Compra, corrección…" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Aplicar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CompleteFollowUpButton({ id }: { id: string }) {
  const { pending, run } = useAct();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        className="hover:bg-accent inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs font-medium"
      >
        {pending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Check className="size-3" />
        )}
        Resolver
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(["hecho", "omitido", "reprogramado"] as const).map((e) => (
          <DropdownMenuItem
            key={e}
            onSelect={() =>
              run(
                () => completeFollowUp({ id, estado: e }),
                "Seguimiento actualizado",
              )
            }
          >
            {e === "hecho"
              ? "Marcar hecho"
              : e === "omitido"
                ? "Omitir"
                : "Reprogramar"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ScheduleFollowUpsButton({ planId }: { planId: string }) {
  const { pending, run } = useAct();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        run(
          () => scheduleFollowUps({ plan_id: planId }),
          "Controles 15/30/60 agendados",
        )
      }
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <CalendarClock className="size-3.5" />
      )}
      Agendar 15/30/60
    </Button>
  );
}
