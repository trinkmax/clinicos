"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { pageActionFor } from "@/config/page-actions";
import type { Role } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";

/**
 * Acción primaria contextual en el topbar. Lee el mapping en
 * `src/config/page-actions.ts` y solo renderiza si:
 *  - el path matchea una entrada, y
 *  - el rol del usuario está habilitado para esa acción.
 */
export function PageAction({ role }: { role: Role | null }) {
  const pathname = usePathname();
  const action = pageActionFor(pathname, role);

  if (!action) return null;
  if (!action.href) return null;

  return (
    <Button size="default" render={<Link href={action.href} />}>
      <action.icon className="size-4" />
      <span className="hidden sm:inline">{action.label}</span>
    </Button>
  );
}
