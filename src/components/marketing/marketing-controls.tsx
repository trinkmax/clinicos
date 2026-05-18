"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Megaphone,
  Workflow,
  Play,
  Power,
} from "lucide-react";
import { toast } from "sonner";

import {
  createSegment,
  createCampaign,
  createAutomation,
  toggleAutomation,
  runFollowupAutomations,
} from "@/lib/actions/marketing";
import {
  PRESET_LABEL,
} from "@/lib/validation/marketing";
import { ETAPA_LABEL, CONTACT_ETAPA } from "@/lib/validation/crm";
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
  "border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2";

function useAct() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    okMsg: string,
    onOk?: () => void,
  ) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast.success(okMsg);
        onOk?.();
        router.refresh();
      } else toast.error(r.error ?? "Error");
    });
  return { pending, run };
}

export function NewSegmentDialog() {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAct();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Plus className="size-3.5" />
            Segmento
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo segmento</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) =>
            run(
              () => createSegment(Object.fromEntries(fd)),
              "Segmento creado",
              () => setOpen(false),
            )
          }
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="etapa">Etapa del contacto</Label>
            <select id="etapa" name="etapa" className={selectCls}>
              <option value="">Todos</option>
              {CONTACT_ETAPA.map((e) => (
                <option key={e} value={e}>
                  {ETAPA_LABEL[e]}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewCampaignDialog({
  segments,
  templates,
}: {
  segments: { id: string; nombre: string }[];
  templates: { id: string; nombre: string }[];
}) {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAct();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Megaphone className="size-3.5" />
            Campaña
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva campaña</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) =>
            run(
              () => createCampaign(Object.fromEntries(fd)),
              "Campaña creada",
              () => setOpen(false),
            )
          }
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="segment_id">Segmento</Label>
            <select id="segment_id" name="segment_id" className={selectCls}>
              <option value="">— Sin segmento —</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="template_id">Plantilla</Label>
            <select id="template_id" name="template_id" className={selectCls}>
              <option value="">— Sin plantilla —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function NewAutomationDialog() {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAct();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Workflow className="size-3.5" />
            Nueva automatización
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva automatización</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) =>
            run(
              () => createAutomation(Object.fromEntries(fd)),
              "Automatización creada (activala para que corra)",
              () => setOpen(false),
            )
          }
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preset">Tipo</Label>
            <select
              id="preset"
              name="preset"
              className={selectCls}
              defaultValue="controles_15_30_60"
            >
              {Object.entries(PRESET_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AutomationToggle({
  id,
  activo,
}: {
  id: string;
  activo: boolean;
}) {
  const { pending, run } = useAct();
  return (
    <Button
      size="sm"
      variant={activo ? "default" : "outline"}
      disabled={pending}
      onClick={() =>
        run(
          () => toggleAutomation(id, !activo),
          activo ? "Pausada" : "Activada",
        )
      }
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Power className="size-3.5" />
      )}
      {activo ? "Activa" : "Pausada"}
    </Button>
  );
}

export function RunNowButton() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await runFollowupAutomations();
          if (r.ok)
            toast.success(
              `${r.data.enviados} mensaje(s) de control/adherencia encolado(s)`,
            );
          else toast.error(r.error);
          router.refresh();
        })
      }
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Play className="size-4" />
      )}
      Ejecutar controles ahora
    </Button>
  );
}
