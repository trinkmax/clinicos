"use client";

import { useTransition } from "react";
import { LogOut, UserRound } from "lucide-react";

import { signOut } from "@/lib/auth/actions";
import { ROLE_LABELS, type Role } from "@/lib/auth/roles";
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
  const [pending, start] = useTransition();
  const display = fullName?.trim() || email || "Usuario";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors outline-none focus-visible:ring-2">
        <Avatar className="size-8 rounded-lg">
          <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-xs font-semibold">
            {initials(email ?? "US")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
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
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            start(() => void signOut());
          }}
        >
          <LogOut className="size-4" />
          {pending ? "Cerrando sesión…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
