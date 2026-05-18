"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Loader2,
  ScanLine,
  FileText,
  ImageIcon,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { uploadDocument } from "@/lib/actions/documents";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DOC_TYPES: { value: string; label: string }[] = [
  { value: "ficha_ingreso", label: "Ficha de Ingreso" },
  { value: "test_psicologico", label: "Test Psicológico" },
  { value: "historia_clinica", label: "Historia Clínica (6 hojas)" },
  { value: "consentimiento", label: "Consentimiento Informado" },
  { value: "datos_comerciales", label: "Datos Comerciales" },
  { value: "receta", label: "Receta" },
  { value: "comprobante_pago", label: "Comprobante de pago" },
  { value: "estudio", label: "Estudio" },
  { value: "otro", label: "Otro" },
];

const ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp,image/heic,image/tiff";

function prettyBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1_048_576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1_048_576).toFixed(1)} MB`;
}

export function DocumentUpload({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("ficha_ingreso");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const preview =
    file && file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;

  function pick(f: File | null | undefined) {
    if (!f) return;
    if (f.size > 31_457_280) {
      toast.error("El archivo supera el máximo de 30 MB.");
      return;
    }
    setFile(f);
  }

  function reset() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function submit() {
    if (!file) {
      toast.error("Adjuntá el escaneo (PDF o imagen).");
      return;
    }
    const fd = new FormData();
    fd.set("patientId", patientId);
    fd.set("docType", docType);
    fd.set("file", file);
    start(async () => {
      const res = await uploadDocument(fd);
      if (res.ok) {
        toast.success(
          res.data.extracted
            ? "Documento escaneado y digitalizado por IA. Revisalo."
            : "Documento subido. La extracción IA falló; reintentá luego.",
        );
        setOpen(false);
        reset();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <ScanLine className="size-4" />
            Escanear documento
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary grid size-7 place-items-center rounded-lg">
              <Sparkles className="size-4" />
            </span>
            Escanear documento
          </DialogTitle>
          <DialogDescription>
            Subí el papel (PDF o foto). La IA lo digitaliza y después validás
            los datos contra el original.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="docType">Tipo de documento</Label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
            >
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {!file ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pick(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "bg-dotgrid flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/[0.04]"
                  : "border-border hover:border-primary/40 hover:bg-accent/30",
              )}
            >
              <span className="bg-primary/10 text-primary grid size-12 place-items-center rounded-2xl">
                <Upload className="size-5" />
              </span>
              <span className="text-sm font-medium">
                Arrastrá el archivo o hacé clic
              </span>
              <span className="text-muted-foreground text-xs">
                PDF o imagen · hasta 30 MB
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border p-3">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Vista previa"
                  className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-foreground/10"
                />
              ) : (
                <span className="bg-muted grid size-14 shrink-0 place-items-center rounded-lg">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="size-5" />
                  ) : (
                    <FileText className="size-5" />
                  )}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {prettyBytes(file.size)}
                </p>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={reset}
                disabled={pending}
                aria-label="Quitar archivo"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />

          <Button
            onClick={submit}
            disabled={pending || !file}
            className="w-full"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Digitalizando con IA…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Subir y digitalizar
              </>
            )}
          </Button>
          {pending && (
            <p className="text-muted-foreground text-center text-xs">
              Subiendo el escaneo y extrayendo los campos. No cierres esta
              ventana.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
