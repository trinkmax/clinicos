"use client";

import { useActionState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";

import {
  setNewPassword,
  type ResetPasswordState,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetForm({ email }: { email: string }) {
  const [state, formAction, isPending] = useActionState<
    ResetPasswordState,
    FormData
  >(setNewPassword, {});
  const [show, setShow] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className="space-y-8"
    >
      <div className="space-y-3">
        <Image
          src="/brand/logo-full.png"
          alt="Control Group Salud"
          width={176}
          height={77}
          priority
          className="h-11 w-auto"
        />
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Nueva contraseña
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Elegí una contraseña para {email}. Mínimo 8 caracteres.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              autoFocus
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 transition-colors"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar contraseña</Label>
          <Input
            id="confirm"
            name="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            className="h-11"
          />
        </div>

        {state.error && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: [0, -6, 6, -3, 0] }}
            transition={{ duration: 0.4 }}
            role="alert"
            className="text-destructive bg-destructive/8 border-destructive/20 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm"
          >
            <ShieldAlert className="size-4 shrink-0" />
            {state.error}
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full text-[15px]"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <KeyRound className="size-4" />
              Actualizar contraseña
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
