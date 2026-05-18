"use client";

import { useActionState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";

import { signIn, type SignInState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState<SignInState, FormData>(
    signIn,
    {},
  );

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
            Ingresá a tu cuenta
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Acceso exclusivo del equipo de la clínica.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="next" value={next ?? "/"} />

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

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
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
              Ingresando…
            </>
          ) : (
            <>
              <LogIn className="size-4" />
              Ingresar
            </>
          )}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-xs leading-relaxed">
        Sistema interno · Control Group Salud. El acceso se otorga por
        invitación del administrador.
      </p>
    </motion.div>
  );
}
