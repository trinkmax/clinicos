"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS: { value: "light" | "dark" | "system"; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function ThemeToggle({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita mismatch SSR/cliente: hasta que el componente monta usamos el ícono
  // neutro. Patrón estándar de next-themes; el setState ocurre una sola vez
  // en mount y no causa cascading renders en práctica.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const current = mounted ? theme ?? "system" : "system";
  const Icon =
    !mounted || current === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Moon
        : Sun;
  const currentLabel =
    OPTIONS.find((o) => o.value === current)?.label ?? "Sistema";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "size-8 justify-center" : "h-9 px-2.5 text-sm",
          className,
        )}
        aria-label={`Tema: ${currentLabel}`}
      >
        <Icon className="size-4" />
        {!compact && <span>{currentLabel}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            data-active={current === opt.value || undefined}
          >
            <opt.icon className="size-4" />
            {opt.label}
            {current === opt.value && (
              <span className="text-muted-foreground ml-auto text-[10px]">
                ●
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
