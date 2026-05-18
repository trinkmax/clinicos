"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Stethoscope,
  FileSignature,
  ArrowUpToLine,
  Eye,
  NotebookPen,
} from "lucide-react";
import { toast } from "sonner";

import {
  createEpisode,
  updateEpisodeStatus,
  promoteExtraction,
  signClinicalHistory,
  addClinicalNote,
  getDocumentSignedUrl,
} from "@/lib/actions/clinical";
import {
  CONDICIONES,
  CONDICION_LABEL,
  EPISODE_ESTADO,
  EPISODE_ESTADO_LABEL,
} from "@/lib/validation/clinical";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignaturePad } from "@/components/clinical/signature-pad";

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

export function NewEpisodeDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const { pending, run } = useAct();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            <Stethoscope className="size-3.5" />
            Nuevo episodio
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo episodio clínico</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Label>Condiciones</Label>
          <div className="grid grid-cols-1 gap-2">
            {CONDICIONES.map((c) => (
              <label
                key={c}
                className="hover:bg-accent flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={sel.includes(c)}
                  onChange={(e) =>
                    setSel((s) =>
                      e.target.checked
                        ? [...s, c]
                        : s.filter((x) => x !== c),
                    )
                  }
                />
                {CONDICION_LABEL[c]}
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={pending}
            onClick={() =>
              run(
                () =>
                  createEpisode({ patient_id: patientId, condiciones: sel }),
                "Episodio creado",
                () => {
                  setOpen(false);
                  setSel([]);
                },
              )
            }
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Crear episodio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EpisodeStatusMenu({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const { pending, run } = useAct();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        className="bg-accent text-accent-foreground inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium"
      >
        {EPISODE_ESTADO_LABEL[status as keyof typeof EPISODE_ESTADO_LABEL] ??
          status}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {EPISODE_ESTADO.map((e) => (
          <DropdownMenuItem
            key={e}
            onSelect={() =>
              run(
                () => updateEpisodeStatus(id, e),
                "Estado actualizado",
              )
            }
          >
            {EPISODE_ESTADO_LABEL[e]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PromoteExtractionButton({
  extractionId,
  patientId,
}: {
  extractionId: string;
  patientId: string;
}) {
  const { pending, run } = useAct();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        run(
          () =>
            promoteExtraction({
              extraction_id: extractionId,
              patient_id: patientId,
            }),
          "Registrado en la HCE",
        )
      }
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <ArrowUpToLine className="size-3.5" />
      )}
      Promover a HCE
    </Button>
  );
}

export function DocumentViewerButton({
  documentId,
}: {
  documentId: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await getDocumentSignedUrl(documentId);
          if (r.ok) window.open(r.data.url, "_blank", "noopener");
          else toast.error(r.error);
        })
      }
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Eye className="size-3.5" />
      )}
      Ver original
    </Button>
  );
}

export function SignHistoryButton({ historyId }: { historyId: string }) {
  const [open, setOpen] = useState(false);
  const [sig, setSig] = useState<string | null>(null);
  const { pending, run } = useAct();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <FileSignature className="size-3.5" />
            Firmar y cerrar HC
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Firmar y cerrar Historia Clínica</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Firma electrónica avanzada con trazabilidad (hash, fecha, IP,
          dispositivo). Una vez firmada, la HC queda inmutable (Ley 26.529);
          las correcciones se hacen por addenda.
        </p>
        <SignaturePad onChange={setSig} />
        <DialogFooter>
          <Button
            disabled={pending || !sig}
            onClick={() =>
              run(
                () =>
                  signClinicalHistory({
                    id: historyId,
                    signature_data: sig!,
                  }),
                "HC firmada y cerrada",
                () => setOpen(false),
              )
            }
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Firmar y cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AddNoteForm({
  patientId,
  episodeId,
}: {
  patientId: string;
  episodeId?: string | null;
}) {
  const { pending, run } = useAct();
  const [val, setVal] = useState("");
  return (
    <form
      action={() =>
        run(
          () =>
            addClinicalNote({
              patient_id: patientId,
              episode_id: episodeId ?? undefined,
              tipo: "nota",
              contenido: val,
            }),
          "Nota agregada",
          () => setVal(""),
        )
      }
      className="space-y-2"
    >
      <div className="flex items-start gap-2">
        <NotebookPen className="text-muted-foreground mt-2 size-4 shrink-0" />
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Nueva nota / seguimiento / addendum…"
          rows={2}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending || !val.trim()}>
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Agregar nota
        </Button>
      </div>
    </form>
  );
}
