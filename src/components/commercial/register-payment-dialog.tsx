"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { registerPayment } from "@/lib/actions/commercial";
import { formatARS } from "@/lib/validation/commercial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RegisterPaymentDialog({
  planId,
  patientId,
  saldo,
}: {
  planId: string;
  patientId: string;
  saldo: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    formData.set("plan_id", planId);
    formData.set("patient_id", patientId);
    start(async () => {
      const res = await registerPayment(Object.fromEntries(formData));
      if (res.ok) {
        toast.success("Pago registrado");
        setOpen(false);
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Wallet className="size-3.5" />
            Registrar pago
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>
            Saldo actual: {formatARS(saldo)}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="importe">Importe (ARS)</Label>
            <Input
              id="importe"
              name="importe"
              type="number"
              min={1}
              step="any"
              required
              autoFocus
              defaultValue={saldo > 0 ? saldo : undefined}
            />
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
          <div className="space-y-1.5">
            <Label htmlFor="medio">Medio</Label>
            <Input
              id="medio"
              name="medio"
              placeholder="Efectivo, transferencia…"
            />
          </div>
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
