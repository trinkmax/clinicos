"use client";

import Link from "next/link";
import { useRef } from "react";
import { LifeBuoy, LogOut, Settings, UserRound } from "lucide-react";

import { signOut } from "@/lib/auth/actions";
import { ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(value: string) {
  const base = value.split("@")[0] ?? value;
  return base.slice(0, 2).toUpperCase();
}

/**
 * Versión topbar del menú de usuario. Avatar como trigger, dropdown completo
 * con Mi perfil / Ajustes / Ayuda / Cerrar sesión.
 *
 * Detalles non-obvious:
 * - El header del menú es un <div> estilizado, NO `DropdownMenuLabel` —
 *   `Menu.GroupLabel` exige un `Menu.Group` ancestro y sin él lanza
 *   "MenuGroupContext is missing", lo que crashea TODA página dentro de
 *   `(app)/*` (el topbar se monta en todas).
 * - El logout usa un form oculto + `requestSubmit()` desde un onClick para
 *   evitar mezclar el `DropdownMenuItem` con `render=<button>` (que Base UI
 *   marca como inconsistente: `nativeButton` aplica al item entero y Link
 *   en otros items lo dejan en false, peleándose con el button submit).
 */
export function TopbarUserMenu({
  email,
  fullName,
  role,
}: {
  email: string | null;
  fullName: string | null;
  role: Role | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const display = fullName?.trim() || email || "Usuario";
  const ini = initials(email ?? fullName ?? "US");

  function triggerSignOut() {
    formRef.current?.requestSubmit();
  }

  return (
    <>
      {/* Form aislado para el logout — fuera del portal del menú. */}
      <form ref={formRef} action={signOut} className="hidden" />

      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          aria-label="Cuenta"
          className={cn(
            "hover:bg-accent focus-visible:ring-ring inline-flex items-center gap-2 rounded-lg p-1 outline-none transition-colors focus-visible:ring-2",
          )}
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="bg-primary/12 text-primary rounded-lg text-xs font-semibold">
              {ini}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="w-60">
          {/* Header del menú — div estilizado, no Menu.GroupLabel (ver arriba). */}
          <div className="flex items-center gap-2.5 px-2 py-2">
            <Avatar className="size-9 shrink-0 rounded-lg">
              <AvatarFallback className="bg-primary/12 text-primary rounded-lg text-xs font-semibold">
                {ini}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{display}</p>
              <p className="text-muted-foreground truncate text-xs">
                {role ? ROLE_LABELS[role] : email ?? "Sin rol"}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/perfil" />}
          >
            <UserRound className="size-4" />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href="/ajustes" />}
          >
            <Settings className="size-4" />
            Ajustes
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <LifeBuoy className="size-4" />
            Ayuda
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={triggerSignOut}
            onSelect={triggerSignOut}
            className="cursor-pointer"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
