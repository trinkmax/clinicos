"use client";

import {
  Users,
  Wallet,
  TrendingUp,
  HandCoins,
  type LucideIcon,
} from "lucide-react";

import { formatARS } from "@/lib/validation/commercial";
import { StatCard } from "@/components/ui/stat-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const ICONS: Record<string, LucideIcon> = {
  users: Users,
  wallet: Wallet,
  trending: TrendingUp,
  coins: HandCoins,
};

export interface ReportesKpi {
  label: string;
  value: number;
  accent: string;
  icon: keyof typeof ICONS;
  money?: boolean;
  hint?: string;
}

/**
 * Isla cliente para los KPIs de Reportes: el page server pasa solo datos
 * serializables (íconos por clave, no por componente; sin funciones).
 */
export function ReportesKpis({ kpis }: { kpis: ReportesKpi[] }) {
  return (
    <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((k) => (
        <StaggerItem key={k.label}>
          <StatCard
            label={k.label}
            value={k.value}
            icon={ICONS[k.icon] ?? Users}
            accent={k.accent}
            format={k.money ? formatARS : undefined}
            hint={k.hint}
          />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
