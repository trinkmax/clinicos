"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";

import { upsertAutomation } from "@/lib/actions/marketing";
import {
  TRIGGER_TYPES,
  TRIGGER_LABEL,
  ACTION_TYPES,
  ACTION_LABEL,
} from "@/lib/validation/marketing";
import { CONTACT_ETAPA, ETAPA_LABEL } from "@/lib/validation/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const selectCls =
  "border-input bg-background focus-visible:ring-ring h-9 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-2";

type Cond = { field: string; op: string; value: string };
type Act = { type: string; config: Record<string, string> };

export function AutomationBuilder({
  initial,
  triggerLabel = "Builder visual",
}: {
  initial?: {
    id: string;
    nombre: string;
    trigger: { type: string; conditions: Cond[] };
    acciones: Act[];
  };
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [triggerType, setTriggerType] = useState<string>(
    initial?.trigger?.type ?? TRIGGER_TYPES[0],
  );
  const [conds, setConds] = useState<Cond[]>(
    initial?.trigger?.conditions ?? [],
  );
  const [acts, setActs] = useState<Act[]>(
    initial?.acciones?.length
      ? initial.acciones
      : [{ type: "enviar_whatsapp", config: {} }],
  );

  function move(i: number, d: -1 | 1) {
    setActs((a) => {
      const n = [...a];
      const j = i + d;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }
  function setActCfg(i: number, key: string, val: string) {
    setActs((a) =>
      a.map((x, k) =>
        k === i ? { ...x, config: { ...x.config, [key]: val } } : x,
      ),
    );
  }

  function save() {
    start(async () => {
      const r = await upsertAutomation({
        id: initial?.id,
        nombre,
        trigger: { type: triggerType, conditions: conds },
        acciones: acts,
      });
      if (r.ok) {
        toast.success("Automatización guardada");
        setOpen(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant={initial ? "ghost" : "default"}>
            <Workflow className="size-3.5" />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Editar automatización" : "Builder de automatización"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="auto-nombre">Nombre</Label>
            <Input
              id="auto-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Recordatorio post-consulta"
            />
          </div>

          {/* Disparador */}
          <div className="space-y-2 rounded-xl border p-4">
            <p className="text-xs font-semibold tracking-wide uppercase">
              Cuando…
            </p>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className={`${selectCls} w-full`}
            >
              {TRIGGER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TRIGGER_LABEL[t]}
                </option>
              ))}
            </select>
            <div className="space-y-2">
              {conds.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={c.field}
                    placeholder="campo (ej: dias)"
                    onChange={(e) =>
                      setConds((cs) =>
                        cs.map((x, k) =>
                          k === i ? { ...x, field: e.target.value } : x,
                        ),
                      )
                    }
                    className="h-9"
                  />
                  <select
                    value={c.op}
                    onChange={(e) =>
                      setConds((cs) =>
                        cs.map((x, k) =>
                          k === i ? { ...x, op: e.target.value } : x,
                        ),
                      )
                    }
                    className={selectCls}
                  >
                    {["=", "!=", ">", "<", "contiene"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <Input
                    value={c.value}
                    placeholder="valor"
                    onChange={(e) =>
                      setConds((cs) =>
                        cs.map((x, k) =>
                          k === i ? { ...x, value: e.target.value } : x,
                        ),
                      )
                    }
                    className="h-9"
                  />
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() =>
                      setConds((cs) => cs.filter((_, k) => k !== i))
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setConds((cs) => [...cs, { field: "", op: "=", value: "" }])
                }
              >
                <Plus className="size-3.5" />
                Condición
              </Button>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase">
              Entonces… (pasos en orden)
            </p>
            {acts.map((a, i) => (
              <div key={i} className="space-y-2 rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary grid size-6 place-items-center rounded-full text-xs font-semibold">
                    {i + 1}
                  </span>
                  <select
                    value={a.type}
                    onChange={(e) =>
                      setActs((x) =>
                        x.map((y, k) =>
                          k === i
                            ? { type: e.target.value, config: {} }
                            : y,
                        ),
                      )
                    }
                    className={`${selectCls} flex-1`}
                  >
                    {ACTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {ACTION_LABEL[t]}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() =>
                      setActs((x) => x.filter((_, k) => k !== i))
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                {a.type === "enviar_whatsapp" && (
                  <textarea
                    value={a.config.mensaje ?? ""}
                    onChange={(e) =>
                      setActCfg(i, "mensaje", e.target.value)
                    }
                    rows={2}
                    placeholder="Mensaje (podés usar {{nombre}})"
                    className="border-input bg-background focus-visible:ring-ring w-full rounded-lg border px-2.5 py-2 text-sm outline-none focus-visible:ring-2"
                  />
                )}
                {a.type === "esperar_dias" && (
                  <Input
                    type="number"
                    min={1}
                    value={a.config.dias ?? ""}
                    onChange={(e) => setActCfg(i, "dias", e.target.value)}
                    placeholder="Días a esperar"
                    className="h-9"
                  />
                )}
                {a.type === "crear_tarea" && (
                  <Input
                    value={a.config.titulo ?? ""}
                    onChange={(e) => setActCfg(i, "titulo", e.target.value)}
                    placeholder="Título de la tarea"
                    className="h-9"
                  />
                )}
                {a.type === "cambiar_etapa" && (
                  <select
                    value={a.config.etapa ?? ""}
                    onChange={(e) => setActCfg(i, "etapa", e.target.value)}
                    className={`${selectCls} w-full`}
                  >
                    <option value="">Elegí etapa…</option>
                    {CONTACT_ETAPA.map((e) => (
                      <option key={e} value={e}>
                        {ETAPA_LABEL[e]}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setActs((x) => [
                  ...x,
                  { type: "enviar_whatsapp", config: {} },
                ])
              }
            >
              <Plus className="size-3.5" />
              Agregar paso
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={save} disabled={pending || !nombre.trim()}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Guardar automatización
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
