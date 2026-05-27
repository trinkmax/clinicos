"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, KeyRound, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { changePassword, updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NameForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res.ok) {
        toast.success("Perfil actualizado");
        setName(res.data.full_name);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre completo</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={name}
            required
            minLength={2}
            maxLength={80}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email_ro">Email</Label>
          <Input
            id="email_ro"
            value={email ?? ""}
            readOnly
            className="bg-muted/40 text-muted-foreground h-10"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} size="default">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ok, setOk] = useState(false);

  function onSubmit(formData: FormData) {
    setErrors({});
    setOk(false);
    startTransition(async () => {
      const res = await changePassword(formData);
      if (res.ok) {
        setOk(true);
        toast.success("Contraseña actualizada");
      } else {
        if (res.fieldErrors) setErrors(res.fieldErrors);
        else toast.error(res.error);
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="current">Actual</Label>
          <Input
            id="current"
            name="current"
            type="password"
            required
            autoComplete="current-password"
            className="h-10"
          />
          {errors.current && (
            <p className="text-destructive text-xs">{errors.current}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="next">Nueva</Label>
          <Input
            id="next"
            name="next"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-10"
          />
          {errors.next && (
            <p className="text-destructive text-xs">{errors.next}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            className="h-10"
          />
          {errors.confirm && (
            <p className="text-destructive text-xs">{errors.confirm}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {ok && (
          <span className="text-success inline-flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="size-3.5" />
            Listo
          </span>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Actualizando…
            </>
          ) : (
            <>
              <KeyRound className="size-4" />
              Cambiar contraseña
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
