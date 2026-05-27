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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(value: string) {
  const base = value.split("@")[0] ?? value;
  return base.slice(0, 2).toUpperCase();
}

/**
 * Versión topbar del menú de usuario. Avatar como trigger,
 * dropdown completo con Mi perfil / Ajustes / Ayuda / Cerrar sesión.
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
  const display = fullName?.trim() || email || "Usuario";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Cuenta"
        className={cn(
          "hover:bg-accent focus-visible:ring-ring inline-flex items-center gap-2 rounded-lg p-1 outline-none transition-colors focus-visible:ring-2",
        )}
      >
        <Avatar className="size-8 rounded-lg">
          <AvatarFallback className="bg-primary/12 text-primary rounded-lg text-xs font-semibold">
            {initials(email ?? fullName ?? "US")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2.5 py-2 font-normal">
          <Avatar className="size-9 shrink-0 rounded-lg">
            <AvatarFallback className="bg-primary/12 text-primary rounded-lg text-xs font-semibold">
              {initials(email ?? fullName ?? "US")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{display}</p>
            <p className="text-muted-foreground truncate text-xs">
              {role ? ROLE_LABELS[role] : email ?? "Sin rol"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/perfil" />}>
          <UserRound className="size-4" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/ajustes" />}>
          <Settings className="size-4" />
          Ajustes
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <LifeBuoy className="size-4" />
          Ayuda
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem
            variant="destructive"
            render={<button type="submit" className="w-full cursor-pointer" />}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
