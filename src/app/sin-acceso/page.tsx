import type { Metadata } from "next";
import { ShieldQuestion } from "lucide-react";

import { requireAuth } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sin acceso" };

export default async function SinAccesoPage() {
  // Requiere sesión, pero no tenant/rol: el usuario existe pero aún no fue
  // asignado a la clínica (provisión pendiente por un administrador).
  const auth = await requireAuth();

  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="bg-warning/12 text-warning mx-auto grid size-14 place-items-center rounded-2xl">
          <ShieldQuestion className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Cuenta sin clínica asignada
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Tu cuenta{auth.email ? ` (${auth.email})` : ""} está activa pero
            todavía no fue vinculada a Control Group Salud ni se le asignó un
            rol. Pedile a un administrador que complete la activación.
          </p>
        </div>
        <form action={signOut}>
          <Button variant="outline" type="submit" className="w-full">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
