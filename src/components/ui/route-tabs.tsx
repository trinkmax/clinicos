"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface RouteTabsItem {
  /** ID único (sin slashes), también el `value` del trigger. */
  id: string;
  /** Ruta a navegar (la primera coincidencia ganando con `match` decide la activa). */
  href: string;
  label: ReactNode;
  /** Coincidencia exacta o prefijo. Default: prefijo (true cuando pathname empieza con href). */
  exact?: boolean;
}

/**
 * Tabs orientadas a navegación: cada trigger es un `<Link>` y la activa se
 * decide por el `usePathname()` actual. Útil para layouts donde cada
 * sub-ruta es una página independiente (ej. /ajustes/{clinica,equipo,…}).
 */
export function RouteTabs({
  items,
  variant = "line",
  className,
  listClassName,
}: {
  items: RouteTabsItem[];
  variant?: "default" | "line";
  className?: string;
  listClassName?: string;
}) {
  const pathname = usePathname();

  const active =
    items.find((t) =>
      t.exact ? pathname === t.href : pathname === t.href,
    )?.id ??
    items
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((t) => pathname.startsWith(t.href + "/") || pathname === t.href)
      ?.id ??
    items[0]?.id;

  return (
    <Tabs value={active} className={cn("overflow-x-auto", className)}>
      <TabsList variant={variant} className={cn("w-fit", listClassName)}>
        {items.map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            nativeButton={false}
            render={<Link href={t.href} />}
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
