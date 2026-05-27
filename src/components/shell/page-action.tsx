"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { pageActionFor } from "@/config/page-actions";
import type { Role } from "@/lib/auth/roles";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Acción primaria contextual en el topbar. Lee el mapping en
 * `src/config/page-actions.ts` y solo renderiza si:
 *  - el path matchea una entrada, y
 *  - el rol del usuario está habilitado para esa acción.
 *
 * Renderiza un `<Link>` con clases de button — NO `<Button render={<Link/>}>`,
 * para evitar el warning de Base UI `nativeButton` (el primitive de Button
 * espera un <button> nativo).
 */
export function PageAction({ role }: { role: Role | null }) {
  const pathname = usePathname();
  const action = pageActionFor(pathname, role);

  if (!action) return null;
  if (!action.href) return null;

  return (
    <Link
      href={action.href}
      className={cn(buttonVariants({ variant: "default", size: "default" }))}
    >
      <action.icon className="size-4" />
      <span className="hidden sm:inline">{action.label}</span>
    </Link>
  );
}
