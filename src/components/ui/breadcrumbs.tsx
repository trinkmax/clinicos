import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface Crumb {
  label: ReactNode;
  href?: string;
  current?: boolean;
}

/**
 * Migas de pan. La última miga (sin href o current=true) se renderiza
 * como texto plano. Resto, como Link. Diseñado para topbar denso:
 * tipografía compacta, ChevronRight tenue, sin wrap forzado.
 */
export function Breadcrumbs({
  items,
  showHome = true,
  className,
}: {
  items: Crumb[];
  showHome?: boolean;
  className?: string;
}) {
  const all: Crumb[] = showHome
    ? [{ label: <Home className="size-3.5" />, href: "/" }, ...items]
    : items;

  return (
    <nav
      aria-label="Migas de pan"
      className={cn(
        "text-muted-foreground flex min-w-0 items-center gap-1 text-[13px]",
        className,
      )}
    >
      {all.map((c, i) => {
        const last = i === all.length - 1;
        const current = c.current || (last && !c.href);
        return (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 ? (
              <ChevronRight className="text-muted-foreground/50 size-3.5 shrink-0" />
            ) : null}
            {current || !c.href ? (
              <span
                aria-current={current ? "page" : undefined}
                className={cn(
                  "truncate",
                  current && "text-foreground font-medium",
                )}
              >
                {c.label}
              </span>
            ) : (
              <Link
                href={c.href}
                className="hover:text-foreground inline-flex items-center gap-1 truncate transition-colors"
              >
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
