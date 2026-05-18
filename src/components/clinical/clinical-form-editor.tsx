"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateClinicalRecord } from "@/lib/actions/clinical";
import {
  CLINICAL_FORMS,
  SINO_OPTS,
  type FormField,
} from "@/config/clinical-forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectCls =
  "border-input bg-background focus-visible:ring-ring h-9 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-2";

function fieldKey(f: FormField) {
  return f.sub ? `${f.col}.${f.sub}` : f.col;
}

export function ClinicalFormEditor({
  formKey,
  record,
}: {
  formKey: string;
  record: Record<string, unknown> & { id: string };
}) {
  const cfg = CLINICAL_FORMS[formKey];
  const router = useRouter();
  const [pending, start] = useTransition();

  const [state, setState] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const s of cfg.sections)
      for (const f of s.fields) {
        const colVal = record[f.col];
        let v: unknown = f.sub
          ? (colVal as Record<string, unknown> | null)?.[f.sub]
          : colVal;
        if (typeof v === "boolean") v = v ? "true" : "";
        init[fieldKey(f)] = v == null ? "" : String(v);
      }
    return init;
  });

  function save() {
    start(async () => {
      // Reconstruir payload agrupado por columna
      const payload: Record<string, unknown> = {};
      for (const s of cfg.sections)
        for (const f of s.fields) {
          const raw = state[fieldKey(f)] ?? "";
          let val: unknown = raw === "" ? null : raw;
          if (f.type === "boolean") val = raw === "true";
          if (f.type === "number") val = raw === "" ? null : Number(raw);
          if (f.sub) {
            const cur = (payload[f.col] ??
              (typeof record[f.col] === "object" && record[f.col]
                ? { ...(record[f.col] as object) }
                : {})) as Record<string, unknown>;
            cur[f.sub] = val;
            payload[f.col] = cur;
          } else {
            payload[f.col] = val;
          }
        }
      const r = await updateClinicalRecord(cfg.table, record.id, payload);
      if (r.ok) {
        toast.success("Registro guardado");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-5">
      {cfg.sections.map((sec) => (
        <div key={sec.title} className="space-y-3">
          <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {sec.title}
          </h4>
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
            {sec.fields.map((f) => {
              const k = fieldKey(f);
              const v = state[k] ?? "";
              const set = (val: string) =>
                setState((s) => ({ ...s, [k]: val }));
              return (
                <div
                  key={k}
                  className={
                    f.type === "textarea" ? "space-y-1 sm:col-span-2" : "space-y-1"
                  }
                >
                  <Label htmlFor={k} className="text-xs">
                    {f.label}
                  </Label>
                  {f.type === "textarea" ? (
                    <textarea
                      id={k}
                      value={v}
                      onChange={(e) => set(e.target.value)}
                      rows={2}
                      className="border-input bg-background focus-visible:ring-ring w-full rounded-lg border px-2.5 py-2 text-sm outline-none focus-visible:ring-2"
                    />
                  ) : f.type === "boolean" ? (
                    <label className="flex h-9 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={v === "true"}
                        onChange={(e) =>
                          set(e.target.checked ? "true" : "")
                        }
                      />
                      Sí
                    </label>
                  ) : f.type === "sino" ? (
                    <select
                      id={k}
                      value={v}
                      onChange={(e) => set(e.target.value)}
                      className={selectCls}
                    >
                      {SINO_OPTS.map((o) => (
                        <option key={o} value={o}>
                          {o === ""
                            ? "—"
                            : o === "no_se"
                              ? "No sé"
                              : o.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "select" ? (
                    <select
                      id={k}
                      value={v}
                      onChange={(e) => set(e.target.value)}
                      className={selectCls}
                    >
                      {(f.options ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o === "" ? "—" : o.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={k}
                      type={f.type === "number" ? "number" : "text"}
                      value={v}
                      onChange={(e) => set(e.target.value)}
                      className="h-9"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex justify-end border-t pt-3">
        <Button onClick={save} disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Guardar borrador
        </Button>
      </div>
    </div>
  );
}
