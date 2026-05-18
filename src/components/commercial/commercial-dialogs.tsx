"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PackagePlus, FilePlus2 } from "lucide-react";
import { toast } from "sonner";

import { createProduct, createPlan } from "@/lib/actions/commercial";
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

const selectCls =
  "border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2";

export function NewProductDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PackagePlus className="size-3.5" />
            Producto
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo producto</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) =>
            start(async () => {
              const r = await createProduct(Object.fromEntries(fd));
              if (r.ok) {
                toast.success("Producto creado");
                setOpen(false);
                router.refresh();
              } else toast.error(r.error);
            })
          }
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                name="codigo"
                placeholder="Ej: FIC-X6"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aplicaciones">Aplicaciones</Label>
              <Input
                id="aplicaciones"
                name="aplicaciones"
                type="number"
                min={1}
                defaultValue={1}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: FIC x6 aplicaciones"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="precio">Precio (ARS)</Label>
            <Input id="precio" name="precio" type="number" min={0} step="any" required />
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

export function NewPlanDialog({
  patients,
  products,
}: {
  patients: { id: string; label: string }[];
  products: { id: string; label: string; precio: number }[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <FilePlus2 className="size-3.5" />
            Nuevo plan
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo plan de tratamiento</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) => {
            setErrors({});
            start(async () => {
              const r = await createPlan(Object.fromEntries(fd));
              if (r.ok) {
                toast.success("Plan creado");
                setOpen(false);
                router.refresh();
              } else {
                setErrors(r.fieldErrors ?? {});
                toast.error(r.error);
              }
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="patient_id">Paciente</Label>
            <select id="patient_id" name="patient_id" className={selectCls} required>
              <option value="">Elegí un paciente…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="text-destructive text-xs">{errors.patient_id}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product_id">Producto</Label>
            <select id="product_id" name="product_id" className={selectCls}>
              <option value="">— Sin producto —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="costo_total">Costo total (ARS)</Label>
              <Input
                id="costo_total"
                name="costo_total"
                type="number"
                min={0}
                step="any"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cant_aplicaciones">Aplicaciones</Label>
              <Input
                id="cant_aplicaciones"
                name="cant_aplicaciones"
                type="number"
                min={0}
                defaultValue={0}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inicio">Inicio tratamiento</Label>
            <Input id="inicio" name="inicio" type="date" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Crear plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
