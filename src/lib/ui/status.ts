/**
 * Mapas de estilos compartidos para tonos de estado. Reemplaza copias
 * locales de `ESTADO_STYLE` que vivían duplicadas en cada página y que
 * inevitablemente divergían entre sí.
 *
 * Convención: todos los mapas devuelven clases tailwind ya
 * coloreadas con tokens semánticos (success/warning/info/destructive)
 * para que `.dark` los siga sin cambios.
 */

export const PATIENT_STATUS_STYLE = {
  activo: "bg-info/12 text-info border-info/20",
  en_tratamiento: "bg-success/12 text-success border-success/20",
  alta: "bg-muted text-muted-foreground border-transparent",
  inactivo: "bg-muted text-muted-foreground border-transparent",
} as const;

export const PLAN_ESTADO_STYLE = {
  activo: "bg-success/12 text-success border-success/20",
  completado: "bg-info/12 text-info border-info/20",
  en_mora: "bg-destructive/10 text-destructive border-destructive/20",
  cancelado: "bg-muted text-muted-foreground border-transparent",
} as const;

export const FOLLOWUP_ESTADO_STYLE = {
  pendiente: "bg-warning/15 text-warning-foreground border-warning/30",
  hecho: "bg-success/12 text-success border-success/20",
  cancelado: "bg-muted text-muted-foreground border-transparent",
} as const;

export const CONVERSATION_ESTADO_STYLE = {
  abierta: "bg-success/12 text-success",
  pendiente: "bg-warning/15 text-warning-foreground",
  cerrada: "bg-muted text-muted-foreground",
} as const;

export const CAMPAIGN_ESTADO_STYLE = {
  borrador: "bg-muted text-muted-foreground border-transparent",
  enviando: "bg-info/12 text-info border-info/20",
  enviada: "bg-success/12 text-success border-success/20",
  pausada: "bg-warning/15 text-warning-foreground border-warning/30",
} as const;

export const EPISODE_STATUS_STYLE = {
  abierto: "bg-info/12 text-info border-info/20",
  cerrado: "bg-muted text-muted-foreground border-transparent",
} as const;

/**
 * Devuelve un tono operativo según los días en mora. Se usa
 * en cobranzas: 0-30 informativo, 31-60 alerta tibia, 60+ rojo.
 */
export function moraTone(days: number): string {
  if (days <= 30) return "bg-info/12 text-info";
  if (days <= 60) return "bg-warning/15 text-warning-foreground";
  return "bg-destructive/10 text-destructive";
}

export function statusStyle<K extends string>(
  map: Record<K, string>,
  key: K | string,
): string {
  return (map as Record<string, string>)[key] ?? "";
}
