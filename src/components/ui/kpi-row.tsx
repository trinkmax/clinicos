"use client";

import {
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  HandCoins,
  Bell,
  Package,
  Boxes,
  CalendarClock,
  Megaphone,
  Target,
  Workflow,
  MessagesSquare,
  AlertTriangle,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";

import { formatARS } from "@/lib/validation/commercial";
import { StatCard } from "@/components/ui/stat-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const ICONS = {
  users: Users,
  wallet: Wallet,
  trending: TrendingUp,
  trendingDown: TrendingDown,
  coins: HandCoins,
  bell: Bell,
  package: Package,
  boxes: Boxes,
  calendar: CalendarClock,
  megaphone: Megaphone,
  target: Target,
  workflow: Workflow,
  messages: MessagesSquare,
  alert: AlertTriangle,
  check: CircleCheck,
} satisfies Record<string, LucideIcon>;

export type KpiIcon = keyof typeof ICONS;

export interface KpiItem {
  label: string;
  value: number | string;
  icon: KpiIcon;
  accent?: string;
  money?: boolean;
  hint?: string;
  href?: string;
}

/**
 * Fila de KPIs reutilizable. El page (Server Component) pasa SOLO datos
 * serializables (ícono por clave, `money` en vez de función de formato).
 */
export function KpiRow({
  items,
  className = "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
}: {
  items: KpiItem[];
  className?: string;
}) {
  return (
    <Stagger className={className}>
      {items.map((k) => (
        <StaggerItem key={k.label}>
          <StatCard
            label={k.label}
            value={k.value}
            icon={ICONS[k.icon]}
            accent={k.accent ?? "var(--primary)"}
            format={k.money ? formatARS : undefined}
            hint={k.hint}
            href={k.href}
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
