"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpToLine,
  FileText,
  Loader2,
  Maximize2,
  ScanSearch,
  ShieldCheck,
  TriangleAlert,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";

import { validateExtraction } from "@/lib/actions/documents";
import {
  promoteExtraction,
  getDocumentSignedUrl,
} from "@/lib/actions/clinical";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

type Json = Record<string, unknown>;

function flatten(obj: unknown, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      if (k === "_meta") continue;
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object") Object.assign(out, flatten(v, key));
      else out[key] = v == null ? "" : String(v);
    }
  }
  return out;
}
function unflatten(flat: Record<string, string>): Json {
  const root: Json = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split(".");
    let node: Json = root;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) node[p] = value;
      else node = (node[p] ??= {}) as Json;
    });
  }
  return root;
}
function humanize(seg: string) {
  const s = seg.replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ConfidenceRing({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    pct >= 80
      ? "var(--success)"
      : pct >= 55
        ? "var(--warning)"
        : "var(--destructive)";
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-11 place-items-center">
      <svg width={44} height={44} className="-rotate-90">
        <circle
          cx={22}
          cy={22}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={4}
        />
        <circle
          cx={22}
          cy={22}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums">
        {pct}
      </span>
    </div>
  );
}

export function DocumentReview({
  extractionId,
  documentId,
  patientId,
  docLabel,
  data,
  mime,
  confidence,
  status,
  canEdit,
  canPromote,
}: {
  extractionId: string;
  documentId: string;
  patientId: string;
  docLabel: string;
  data: Json;
  mime: string;
  confidence: number;
  status: string;
  canEdit: boolean;
  canPromote: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [tab, setTab] = useState<"doc" | "datos">("datos");
  const [url, setUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [fields, setFields] = useState<Record<string, string>>(() =>
    flatten(data),
  );

  const validated = status === "validated";
  const readOnly = !canEdit || validated;
  const uncertain = new Set(
    ((data._meta as { uncertain_fields?: string[] } | undefined)
      ?.uncertain_fields ?? []) as string[],
  );
  const isImage = mime.startsWith("image/");

  function ensureUrl() {
    if (url || loadingUrl) return;
    setLoadingUrl(true);
    getDocumentSignedUrl(documentId)
      .then((r) => {
        if (r.ok) setUrl(r.data.url);
      })
      .finally(() => setLoadingUrl(false));
  }

  // Agrupa los campos planos por su primer segmento → secciones legibles.
  const groups = useMemo(() => {
    const map = new Map<string, [string, string][]>();
    for (const [path, value] of Object.entries(fields)) {
      const [head, ...rest] = path.split(".");
      const section = rest.length ? head : "Generales";
      if (!map.has(section)) map.set(section, []);
      map.get(section)!.push([path, value]);
    }
    return [...map.entries()];
  }, [fields]);

  function save() {
    start(async () => {
      const merged = { ...unflatten(fields), _meta: data._meta };
      const res = await validateExtraction(extractionId, merged);
      if (res.ok) {
        toast.success("Datos validados y guardados en la HCE");
        router.refresh();
      } else toast.error(res.error);
    });
  }
  function promote() {
    start(async () => {
      const r = await promoteExtraction({
        extraction_id: extractionId,
        patient_id: patientId,
      });
      if (r.ok) {
        toast.success("Registrado en la HCE");
        setOpen(false);
        router.refresh();
      } else toast.error(r.error ?? "Error");
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o: boolean) => {
        setOpen(o);
        if (o) ensureUrl();
      }}
    >
      <SheetTrigger
        render={
          <Button size="sm" variant={validated ? "outline" : "default"}>
            {validated ? (
              <ShieldCheck className="size-3.5" />
            ) : (
              <ScanSearch className="size-3.5" />
            )}
            {validated ? "Ver validación" : "Revisar y validar"}
          </Button>
        }
      />
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-screen flex-col gap-0 p-0 sm:max-w-[min(96vw,1080px)]"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="flex items-center gap-3">
            <ConfidenceRing value={confidence} />
            <div>
              <p className="text-sm font-semibold tracking-tight">
                {docLabel}
              </p>
              <p className="text-muted-foreground text-xs">
                Revisión humana ·{" "}
                {uncertain.size > 0 ? (
                  <span className="text-warning-foreground">
                    {uncertain.size} campo{uncertain.size === 1 ? "" : "s"} a
                    verificar
                  </span>
                ) : (
                  "sin campos dudosos"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {validated ? (
              <span className="bg-success/12 text-success inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
                <ShieldCheck className="size-3.5" /> Validado
              </span>
            ) : (
              <span className="bg-warning/15 text-warning-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
                <TriangleAlert className="size-3.5" /> En revisión
              </span>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Conmutador mobile */}
        <div className="flex gap-1 border-b p-2 lg:hidden">
          {(["doc", "datos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
                tab === t
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
              )}
            >
              {t === "doc" ? "Documento" : "Datos extraídos"}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-2">
          {/* Documento original */}
          <div
            className={cn(
              "bg-muted/40 relative min-h-0 overflow-auto border-r",
              tab === "doc" ? "block" : "hidden lg:block",
            )}
          >
            {loadingUrl || !url ? (
              <div className="text-muted-foreground grid h-full place-items-center gap-2 p-8 text-center text-sm">
                {loadingUrl ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <FileText className="size-8 opacity-50" />
                )}
                {loadingUrl ? "Cargando el escaneo…" : "Documento no disponible"}
              </div>
            ) : isImage ? (
              <div className="relative">
                <div className="bg-card/80 sticky top-0 z-10 flex items-center justify-between gap-2 border-b px-3 py-1.5 backdrop-blur">
                  <span className="text-muted-foreground text-[11px]">
                    Escaneo original
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
                      aria-label="Alejar"
                    >
                      <ZoomOut className="size-3.5" />
                    </Button>
                    <span className="text-[11px] tabular-nums">
                      {zoom}×
                    </span>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
                      aria-label="Acercar"
                    >
                      <ZoomIn className="size-3.5" />
                    </Button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground hover:bg-accent grid size-6 place-items-center rounded-md"
                      aria-label="Abrir en pestaña nueva"
                    >
                      <Maximize2 className="size-3.5" />
                    </a>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Documento escaneado"
                  className="origin-top-left transition-transform"
                  style={{ width: `${zoom * 100}%` }}
                />
              </div>
            ) : (
              <iframe
                src={url}
                title="Documento escaneado"
                className="h-full min-h-[70vh] w-full"
              />
            )}
          </div>

          {/* Datos extraídos */}
          <div
            className={cn(
              "min-h-0 overflow-y-auto",
              tab === "datos" ? "block" : "hidden lg:block",
            )}
          >
            <div className="space-y-5 p-5">
              {groups.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  La IA no extrajo campos estructurados.
                </p>
              )}
              {groups.map(([section, items]) => (
                <div key={section} className="space-y-3">
                  <h3 className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                    {humanize(section)}
                  </h3>
                  <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                    {items.map(([path, value]) => {
                      const leaf = path.split(".").pop()!;
                      const flagged =
                        uncertain.has(path) || uncertain.has(leaf);
                      return (
                        <div key={path} className="space-y-1">
                          <label
                            htmlFor={path}
                            className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium"
                          >
                            {humanize(leaf)}
                            {flagged && (
                              <span className="bg-warning/20 text-warning-foreground inline-flex items-center gap-0.5 rounded px-1 text-[10px]">
                                <TriangleAlert className="size-2.5" />
                                revisar
                              </span>
                            )}
                          </label>
                          <Input
                            id={path}
                            value={value}
                            disabled={readOnly}
                            aria-invalid={flagged}
                            onChange={(e) =>
                              setFields((f) => ({
                                ...f,
                                [path]: e.target.value,
                              }))
                            }
                            className={cn(
                              "h-8 text-sm",
                              flagged &&
                                !readOnly &&
                                "ring-warning/40 ring-2",
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie de acciones */}
        <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
          <p className="text-muted-foreground text-xs">
            Verificá contra el papel. Lo que guardes queda en la HCE
            (append-only, Ley 26.529).
          </p>
          <div className="flex items-center gap-2">
            {validated ? (
              canPromote && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={promote}
                >
                  {pending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ArrowUpToLine className="size-3.5" />
                  )}
                  Promover a HCE
                </Button>
              )
            ) : (
              !readOnly && (
                <Button size="sm" disabled={pending} onClick={save}>
                  {pending && (
                    <Loader2 className="size-3.5 animate-spin" />
                  )}
                  <ShieldCheck className="size-3.5" />
                  Validar y guardar
                </Button>
              )
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
