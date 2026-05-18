"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { validateExtraction } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Json = Record<string, unknown>;

/** Aplana a hojas escalares: { "paciente.apellido": "Trogu", ... } */
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

export function ExtractionReview({
  extractionId,
  data,
  readOnly,
  validated,
}: {
  extractionId: string;
  docType: string;
  data: Json;
  readOnly: boolean;
  validated: boolean;
}) {
  const initial = useMemo(() => flatten(data), [data]);
  const [fields, setFields] = useState<Record<string, string>>(initial);
  const [openRaw, setOpenRaw] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const uncertain = new Set(
    ((data._meta as { uncertain_fields?: string[] } | undefined)
      ?.uncertain_fields ?? []) as string[],
  );

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

  const entries = Object.entries(fields);

  return (
    <div className="bg-muted/30 border-t">
      <div className="grid gap-x-6 gap-y-3 px-5 py-4 sm:grid-cols-2">
        {entries.map(([path, value]) => {
          const flagged = uncertain.has(path) || uncertain.has(path.split(".").pop()!);
          return (
            <div key={path} className="space-y-1">
              <label
                className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium"
                htmlFor={path}
              >
                {path}
                {flagged && (
                  <span className="bg-warning/20 text-warning-foreground rounded px-1 text-[10px]">
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
                  setFields((f) => ({ ...f, [path]: e.target.value }))
                }
                className="h-8 text-sm"
              />
            </div>
          );
        })}
        {entries.length === 0 && (
          <p className="text-muted-foreground text-sm">
            La IA no extrajo campos estructurados.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4">
        <button
          type="button"
          onClick={() => setOpenRaw((v) => !v)}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          <ChevronDown
            className={`size-3.5 transition-transform ${openRaw ? "rotate-180" : ""}`}
          />
          Ver datos crudos
        </button>
        {validated ? (
          <span className="text-success inline-flex items-center gap-1.5 text-sm font-medium">
            <ShieldCheck className="size-4" />
            Validado
          </span>
        ) : (
          !readOnly && (
            <Button size="sm" onClick={save} disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Validar y guardar en HCE
            </Button>
          )
        )}
      </div>

      {openRaw && (
        <pre className="bg-background mx-5 mb-4 max-h-72 overflow-auto rounded-lg border p-3 text-[11px] leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
