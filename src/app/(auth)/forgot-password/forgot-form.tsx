"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldAlert,
} from "lucide-react";

import {
  requestPasswordReset,
  type ForgotPasswordState,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotForm() {
  const [state, formAction, isPending] = useActionState<
    ForgotPasswordState,
    FormData
  >(requestPasswordReset, {});

  if (state.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
        className="space-y-8 text-center"
      >
        <div className="bg-success/12 text-success mx-auto grid size-14 place-items-center rounded-2xl">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Revisá tu email
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Si existe una cuenta con ese email, te enviamos un enlace para
            restablecer la contraseña. Puede tardar un par de minutos.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          render={<Link href="/login" />}
        >
          <ArrowLeft className="size-4" />
          Volver al inicio de sesión
        </Button>
      </motion.div>
    );
  }

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
            Recuperar contraseña
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            Ingresá el email de tu cuenta. Te mandamos un enlace para
            elegir una nueva contraseña.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@controlgroup.com"
            required
            autoFocus
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
              Enviando…
            </>
          ) : (
            <>
              <Mail className="size-4" />
              Enviar enlace de recuperación
            </>
          )}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        <Link
          href="/login"
          className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Volver al inicio de sesión
        </Link>
      </p>
    </motion.div>
  );
}
