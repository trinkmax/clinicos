/**
 * Lenguaje visual compartido de turnos — usado por el Turnero y el Centro
 * de Control para que un mismo estado se vea idéntico en todo el sistema.
 */

export const TIPO_STYLE: Record<string, string> = {
  primera_vez: "bg-primary/12 text-primary border-primary/20",
  control: "bg-info/12 text-info border-info/20",
  segunda_mas: "bg-accent text-accent-foreground border-transparent",
};

/** Color sólido (var) por tipo — barra de acento de bloques/filas. */
export const TIPO_ACCENT: Record<string, string> = {
  primera_vez: "var(--primary)",
  control: "var(--info)",
  segunda_mas: "var(--chart-3)",
};

export const ESTADO_STYLE: Record<string, string> = {
  programado: "bg-muted text-muted-foreground",
  confirmado: "bg-info/12 text-info",
  presente: "bg-warning/15 text-warning-foreground",
  atendido: "bg-success/12 text-success",
  ausente: "bg-destructive/10 text-destructive",
  cancelado: "bg-muted text-muted-foreground line-through",
};

/** Fondo translúcido del bloque en la grilla por estado. */
export const ESTADO_BLOCK: Record<string, string> = {
  programado:
    "border-border/70 bg-card hover:border-primary/30",
  confirmado:
    "border-info/30 bg-info/[0.07] hover:border-info/50",
  presente:
    "border-warning/40 bg-warning/[0.1] hover:border-warning/60",
  atendido:
    "border-success/30 bg-success/[0.08] hover:border-success/50",
  ausente:
    "border-destructive/25 bg-destructive/[0.06] hover:border-destructive/40",
  cancelado:
    "border-border/50 bg-muted/40 opacity-60 hover:opacity-80",
};
