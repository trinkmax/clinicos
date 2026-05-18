"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createPatient } from "@/lib/actions/patients";
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

export function NewPatientDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setErrors({});
    start(async () => {
      const res = await createPatient(Object.fromEntries(formData));
      if (res.ok) {
        toast.success("Paciente creado");
        setOpen(false);
        router.push(`/pacientes/${res.data.id}`);
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
            <UserPlus className="size-4" />
            Nuevo paciente
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo paciente</DialogTitle>
          <DialogDescription>
            Datos básicos. El resto se completa al digitalizar la Ficha de
            Ingreso.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field
            name="apellido"
            label="Apellido"
            error={errors.apellido}
            required
            autoFocus
          />
          <Field
            name="nombres"
            label="Nombres"
            error={errors.nombres}
            required
          />
          <Field name="dni" label="DNI" error={errors.dni} />
          <Field
            name="fecha_nacimiento"
            label="Fecha de nacimiento"
            type="date"
            error={errors.fecha_nacimiento}
          />
          <Field name="telefono" label="Teléfono" error={errors.telefono} />
          <Field
            name="email"
            label="Email"
            type="email"
            error={errors.email}
          />
          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Crear paciente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  name,
  label,
  error,
  type = "text",
  required,
  autoFocus,
}: {
  name: string;
  label: string;
  error?: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        autoFocus={autoFocus}
        aria-invalid={!!error}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
