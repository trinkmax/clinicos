"use client";

import Link from "next/link";
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
 * NOTA UX-crítica: el `<form action={signOut}>` vive FUERA del
 * `DropdownMenuContent` (que es un Portal al document.body). De estar adentro,
 * un browser con JS no hidratado podía interpretar el click sobre el trigger
 * como submit implícito del form, navegando a /login en una página que
 * todavía no terminó de cargar y mostrando "This page couldn't load".
 * El item de logout linkea al form vía `form="topbar-signout"` + `type="submit"`.
 */
const SIGNOUT_FORM_ID = "topbar-signout";

export function TopbarUserMenu({
  email,
  fullName,
  role,
}: {
  email: string | null;
  fullName: string | null;
  role: Role | null;
}) {
  const display = fullName?.trim() || email || "Usuario";
  const ini = initials(email ?? fullName ?? "US");

  return (
    <>
      {/* Form aislado para el logout — fuera del portal del menú. */}
      <form id={SIGNOUT_FORM_ID} action={signOut} className="hidden" />

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
          {/* Header del menú — un div estilizado, NO DropdownMenuLabel.
             Base UI requiere que GroupLabel viva dentro de un Group; usar
             el primitive sin Group crashea con MenuGroupContext missing. */}
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
          <DropdownMenuItem nativeButton={false} render={<Link href="/perfil" />}>
            <UserRound className="size-4" />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuItem nativeButton={false} render={<Link href="/ajustes" />}>
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
            render={
              <button
                type="submit"
                form={SIGNOUT_FORM_ID}
                className="w-full cursor-pointer"
              />
            }
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
