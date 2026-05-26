import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface InfoSectionProps {
  icon: LucideIcon;
  title: string;
  body: string | null | undefined;
  accent?: string;
  className?: string;
}

/**
 * Sección de información de la ficha de producto. Patrón de "tarjeta narrativa":
 * el ícono toma el color del acento (línea), el cuerpo respira con leading-relaxed.
 */
export function InfoSection({
  icon: Icon,
  title,
  body,
  accent,
  className,
}: InfoSectionProps) {
  if (!body) return null;
  return (
    <Card size="sm" className={cn("p-5", className)}>
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="ring-foreground/8 grid size-9 place-items-center rounded-lg ring-1"
          style={{
            background: accent
              ? `color-mix(in oklch, ${accent} 8%, transparent)`
              : undefined,
          }}
        >
          <Icon
            className="size-4"
            style={{ color: accent ?? undefined }}
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold tracking-tight uppercase">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
            {body}
          </p>
        </div>
      </div>
    </Card>
  );
}
