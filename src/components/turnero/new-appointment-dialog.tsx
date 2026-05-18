"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createAppointment } from "@/lib/actions/appointments";
import { TIPO_LABEL, APPT_TIPO } from "@/lib/validation/appointments";
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

const selectCls =
  "border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2";

export function NewAppointmentDialog({ fecha }: { fecha: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setErrors({});
    start(async () => {
      const res = await createAppointment(Object.fromEntries(formData));
      if (res.ok) {
        toast.success("Turno agendado");
        setOpen(false);
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <CalendarPlus className="size-4" />
            Nuevo turno
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo turno</DialogTitle>
          <DialogDescription>
            Turnos virtuales flexibles fuera de la grilla habitual.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" name="fecha" type="date" defaultValue={fecha} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hora">Hora</Label>
            <Input id="hora" name="hora" type="time" defaultValue="09:00" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo</Label>
            <select id="tipo" name="tipo" className={selectCls} defaultValue="primera_vez">
              {APPT_TIPO.map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="modalidad">Modalidad</Label>
            <select id="modalidad" name="modalidad" className={selectCls} defaultValue="presencial">
              <option value="presencial">Presencial</option>
              <option value="videollamada">Videollamada</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nombre_contacto">Paciente / contacto</Label>
            <Input
              id="nombre_contacto"
              name="nombre_contacto"
              placeholder="Apellido y nombre"
              aria-invalid={!!errors.nombre_contacto}
            />
            {errors.nombre_contacto && (
              <p className="text-destructive text-xs">{errors.nombre_contacto}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="telefono_contacto">Teléfono</Label>
            <Input id="telefono_contacto" name="telefono_contacto" />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="virtual_flexible" value="true" />
            Turno virtual flexible (fuera de grilla)
          </label>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
