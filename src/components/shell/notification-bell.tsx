"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronRight,
  MessagesSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotifSpec {
  count: number;
  href: string;
  label: string;
  hint: string;
  icon: typeof Bell;
  tone: "alert" | "warn" | "info";
}

export function NotificationBell({
  inboxUnread,
  seguimientosVencidos,
  stockBajo,
}: {
  inboxUnread: number;
  seguimientosVencidos: number;
  stockBajo: number;
}) {
  const items: NotifSpec[] = [];
  if (seguimientosVencidos > 0) {
    items.push({
      count: seguimientosVencidos,
      href: "/comercial?tab=seguimientos",
      label: "Seguimientos vencidos",
      hint: "Controles 15/30/60 que pasaron su fecha",
      icon: AlertTriangle,
      tone: "alert",
    });
  }
  if (inboxUnread > 0) {
    items.push({
      count: inboxUnread,
      href: "/inbox",
      label: "Conversaciones abiertas",
      hint: "Esperando respuesta del equipo",
      icon: MessagesSquare,
      tone: "info",
    });
  }
  if (stockBajo > 0) {
    items.push({
      count: stockBajo,
      href: "/comercial?tab=stock",
      label: "Stock bajo mínimo",
      hint: "Insumos a reponer pronto",
      icon: Boxes,
      tone: "warn",
    });
  }

  const total = items.reduce((s, it) => s + it.count, 0);
  const hasAlert = items.some((i) => i.tone === "alert");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:bg-accent text-muted-foreground hover:text-foreground relative inline-flex size-9 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={
          total > 0
            ? `${total} pendientes`
            : "Sin pendientes"
        }
      >
        <Bell className="size-4" />
        {total > 0 ? (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-semibold tabular-nums leading-[18px] ring-2 ring-background",
              hasAlert
                ? "bg-destructive text-destructive-foreground"
                : "bg-warning text-warning-foreground",
            )}
          >
            {total > 99 ? "99+" : total}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <p className="text-sm font-semibold">Pendientes</p>
          <span className="text-muted-foreground text-[11px] tabular-nums">
            {total > 0 ? `${total} total` : "todo al día"}
          </span>
        </div>
        <div className="border-t">
          {items.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-2 px-6 py-10 text-center text-sm">
              <CheckCircle2 className="text-success size-8" />
              No hay alertas. Buen trabajo.
            </div>
          ) : (
            <ul>
              {items.map((it) => (
                <li key={it.label} className="border-b last:border-b-0">
                  <Link
                    href={it.href}
                    className="hover:bg-accent flex items-center gap-3 px-3 py-2.5 transition-colors"
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg",
                        it.tone === "alert"
                          ? "bg-destructive/10 text-destructive"
                          : it.tone === "warn"
                            ? "bg-warning/15 text-warning-foreground"
                            : "bg-info/12 text-info",
                      )}
                    >
                      <it.icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {it.label}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {it.hint}
                      </p>
                    </div>
                    <span className="text-foreground text-sm font-semibold tabular-nums">
                      {it.count}
                    </span>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
