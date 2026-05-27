"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { ALL_NAV_ITEMS } from "@/config/nav";
import type { Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "@/components/shell/notification-bell";
import { PageAction } from "@/components/shell/page-action";
import { TopbarUserMenu } from "@/components/shell/user-menu";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SEGMENT_LABEL: Record<string, string> = {
  pacientes: "Pacientes",
  hce: "Historia clínica",
  documentos: "Documentos",
  notas: "Notas",
  comercial: "Comercial",
  turnos: "Turnos",
  turnero: "Turnero",
  inbox: "Inbox",
  marketing: "Marketing",
  automatizaciones: "Automatizaciones",
  reportes: "Reportes",
  ajustes: "Ajustes",
  equipo: "Equipo",
  integraciones: "Integraciones",
  marca: "Marca",
  bitacora: "Bitácora",
  maxsex: "Maxsex",
  perfil: "Mi perfil",
};

function buildCrumbs(pathname: string): Crumb[] {
  if (pathname === "/") {
    return [{ label: "Inicio", current: true }];
  }
  const parts = pathname.split("/").filter(Boolean);
  // Match contra ALL_NAV_ITEMS para el primer nivel
  const root = parts[0];
  const navRoot = ALL_NAV_ITEMS.find(
    (i) => i.href !== "/" && i.href.replace(/^\//, "") === root,
  );

  const crumbs: Crumb[] = [];

  const rootLabel = navRoot?.title ?? SEGMENT_LABEL[root] ?? root;
  crumbs.push({
    label: rootLabel,
    href: parts.length === 1 ? undefined : `/${root}`,
    current: parts.length === 1,
  });

  for (let i = 1; i < parts.length; i++) {
    const seg = parts[i];
    const isUuid = UUID_RE.test(seg);
    const label = isUuid
      ? // segmento ID: usamos el contexto (root) para nombrarlo
        root === "pacientes"
        ? "Paciente"
        : root === "maxsex"
          ? "Producto"
          : "Detalle"
      : SEGMENT_LABEL[seg] ?? seg.replace(/-/g, " ");

    const last = i === parts.length - 1;
    crumbs.push({
      label,
      href: last ? undefined : "/" + parts.slice(0, i + 1).join("/"),
      current: last,
    });
  }
  return crumbs;
}

function openCommandMenu() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
  );
}

export function AppTopbar({
  email,
  fullName,
  role,
  inboxUnread,
  seguimientosVencidos,
  stockBajo,
}: {
  email: string | null;
  fullName: string | null;
  role: Role | null;
  inboxUnread: number;
  seguimientosVencidos: number;
  stockBajo: number;
}) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  return (
    <header
      className={cn(
        "bg-background/85 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4 backdrop-blur-md",
        "supports-[backdrop-filter]:bg-background/60",
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-0.5 !h-5" />

      <div className="min-w-0 flex-1 overflow-hidden">
        <Breadcrumbs items={crumbs} />
      </div>

      <div className="flex items-center gap-1.5">
        <PageAction role={role} />
        <button
          type="button"
          onClick={openCommandMenu}
          className="text-muted-foreground bg-muted/60 hover:bg-muted hidden h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors md:inline-flex"
          aria-label="Buscar (⌘K)"
        >
          <Search className="size-4" />
          <span>Buscar…</span>
          <kbd className="bg-background ml-1 rounded border px-1.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          onClick={openCommandMenu}
          className="text-muted-foreground hover:bg-accent inline-flex size-9 items-center justify-center rounded-lg transition-colors md:hidden"
          aria-label="Buscar"
        >
          <Search className="size-4" />
        </button>
        <NotificationBell
          inboxUnread={inboxUnread}
          seguimientosVencidos={seguimientosVencidos}
          stockBajo={stockBajo}
        />
        <TopbarUserMenu
          email={email}
          fullName={fullName}
          role={role}
        />
      </div>
    </header>
  );
}

// Re-export para que importaciones existentes desde Server siguen funcionando.
export { AppTopbar as default };
// Lleva a un Link a /login si el user falta — útil para reuso, pero nunca debería llegar acá sin sesión.
export function CrumbHomeLink() {
  return <Link href="/">clinicOS</Link>;
}
