"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  MessagesSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { navForRole, type NavItem } from "@/config/nav";
import type { Role } from "@/lib/auth/roles";
import type { ShellCounters } from "@/lib/data/shell";
import { StatusDot } from "@/components/ui/status-dot";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function counterValue(item: NavItem, counters: ShellCounters): number {
  switch (item.counter) {
    case "turnos":
      return counters.turnosHoy;
    case "inbox":
      return counters.inboxUnread;
    case "vencidos":
      return counters.seguimientosVencidos;
    case "stock":
      return counters.stockBajo;
    default:
      return 0;
  }
}

function badgeToneClass(tone: NavItem["counterTone"]) {
  switch (tone) {
    case "alert":
      return "bg-destructive/12 text-destructive";
    case "warn":
      return "bg-warning/18 text-warning-foreground";
    default:
      return "bg-primary/12 text-primary";
  }
}

function ChannelStatusLabel(state: ShellCounters["channels"]["whatsapp"]) {
  switch (state) {
    case "connected":
      return { label: "Conectado", tone: "live" as const };
    case "pending":
      return { label: "Pendiente de vincular", tone: "warn" as const };
    case "error":
      return { label: "Con errores", tone: "alert" as const };
    case "disconnected":
      return { label: "Desconectado", tone: "alert" as const };
    case "none":
      return { label: "Sin configurar", tone: "idle" as const };
  }
}

export function AppSidebar({
  role,
  counters,
}: {
  role: Role | null;
  counters: ShellCounters;
}) {
  const pathname = usePathname();
  const groups = navForRole(role);

  // Chips "Mi día": solo se muestran si tienen valor o si el rol los puede ver
  const showMiDia =
    counters.turnosHoy > 0 ||
    counters.inboxUnread > 0 ||
    counters.seguimientosVencidos > 0;

  const wa = ChannelStatusLabel(counters.channels.whatsapp);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-3">
        <Link
          href="/"
          className="hover:bg-sidebar-accent flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors"
        >
          <Image
            src="/brand/logo-short.png"
            alt="Control Group"
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-md object-contain"
            priority
          />
          <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">
              clinicOS
            </span>
            <span className="text-muted-foreground text-[11px]">
              Control Group Salud
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {showMiDia && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Mi día</SidebarGroupLabel>
            <div className="grid gap-1 px-1">
              <MiDiaChip
                icon={CalendarClock}
                label="Turnos hoy"
                value={counters.turnosHoy}
                href="/turnero"
                tone="info"
              />
              <MiDiaChip
                icon={MessagesSquare}
                label="Inbox sin leer"
                value={counters.inboxUnread}
                href="/inbox"
                tone="info"
              />
              <MiDiaChip
                icon={AlertTriangle}
                label="Seguim. vencidos"
                value={counters.seguimientosVencidos}
                href="/comercial?tab=seguimientos"
                tone={
                  counters.seguimientosVencidos > 0 ? "alert" : "idle"
                }
              />
            </div>
          </SidebarGroup>
        )}

        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const count = counterValue(item, counters);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={
                        count > 0
                          ? `${item.title} · ${count}`
                          : item.title
                      }
                    >
                      <span className="relative">
                        <item.icon className="size-4" />
                        {count > 0 ? (
                          <span
                            aria-hidden
                            className={cn(
                              "absolute -top-1 -right-1.5 size-1.5 rounded-full ring-2 ring-sidebar",
                              item.counterTone === "alert"
                                ? "bg-destructive"
                                : item.counterTone === "warn"
                                  ? "bg-warning"
                                  : "bg-primary",
                            )}
                          />
                        ) : null}
                      </span>
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {count > 0 && (
                      <SidebarMenuBadge
                        className={cn(
                          "rounded-full px-1.5 text-[10px] font-semibold tabular-nums leading-[18px] group-data-[collapsible=icon]:hidden",
                          badgeToneClass(item.counterTone),
                        )}
                      >
                        {count > 99 ? "99+" : count}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="gap-1.5 p-2">
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="inline-flex items-center gap-1.5">
                  <StatusDot
                    tone={wa.tone}
                    pulse={wa.tone === "live"}
                  />
                  <span className="text-muted-foreground text-[11px]">
                    WhatsApp
                  </span>
                </span>
              }
            />
            <TooltipContent side="top">{wa.label}</TooltipContent>
          </Tooltip>
          <span className="ml-auto" />
          <ThemeToggle compact />
        </div>
        <div className="hidden flex-col items-center gap-1.5 group-data-[collapsible=icon]:flex">
          <StatusDot tone={wa.tone} pulse={wa.tone === "live"} />
          <ThemeToggle compact />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function MiDiaChip({
  icon: Icon,
  label,
  value,
  href,
  tone,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: number;
  href: string;
  tone: "info" | "alert" | "idle";
}) {
  const toneClass =
    tone === "alert"
      ? "ring-destructive/20 hover:ring-destructive/35"
      : tone === "idle"
        ? "ring-foreground/8 hover:ring-foreground/15"
        : "ring-primary/15 hover:ring-primary/30";
  const valueClass =
    tone === "alert"
      ? "text-destructive"
      : tone === "idle"
        ? "text-muted-foreground"
        : "text-primary";

  return (
    <Link
      href={href}
      className={cn(
        "bg-card flex items-center gap-2.5 rounded-md px-2.5 py-2 ring-1 transition-all hover:bg-accent/40",
        toneClass,
      )}
    >
      <Icon className="text-muted-foreground size-3.5 shrink-0" />
      <span className="text-muted-foreground flex-1 truncate text-[12px]">
        {label}
      </span>
      <span
        className={cn(
          "text-[13px] font-semibold tabular-nums",
          valueClass,
        )}
      >
        {value > 99 ? "99+" : value}
      </span>
    </Link>
  );
}
