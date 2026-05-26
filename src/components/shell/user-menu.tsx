"use client";

import { LogOut, UserRound } from "lucide-react";

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

export function UserMenu({
  email,
  role,
  fullName,
}: {
  email: string | null;
  role: Role | null;
  fullName: string | null;
}) {
  const display = fullName?.trim() || email || "Usuario";

  return (
    <div className="group/usermenu flex items-stretch gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "hover:bg-accent focus-visible:ring-ring flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-2 text-left transition-colors outline-none focus-visible:ring-2",
            "group-data-[collapsible=icon]/sidebar-wrapper:justify-center group-data-[collapsible=icon]/sidebar-wrapper:p-1.5",
          )}
        >
          <Avatar className="size-8 shrink-0 rounded-lg">
            <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-xs font-semibold">
              {initials(email ?? "US")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <p className="truncate text-sm font-medium">{display}</p>
            <p className="text-muted-foreground truncate text-xs">
              {role ? ROLE_LABELS[role] : "Sin rol"}
            </p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium">{display}</p>
            <p className="text-muted-foreground truncate text-xs">{email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <UserRound className="size-4" />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/*
            El dropdown usa un <form> con la server action directa: nada de
            useTransition (que se traga el NEXT_REDIRECT en algunos casos).
            El item es el botón submit del form.
          */}
          <form action={signOut}>
            <DropdownMenuItem
              variant="destructive"
              render={
                <button
                  type="submit"
                  className="w-full cursor-pointer"
                />
              }
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Botón de cierre directo: 1 click, sin depender del dropdown. */}
      <form
        action={signOut}
        className="shrink-0 group-data-[collapsible=icon]/sidebar-wrapper:hidden"
      >
        <button
          type="submit"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring flex h-full items-center justify-center rounded-lg px-2 transition-colors outline-none focus-visible:ring-2"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}
