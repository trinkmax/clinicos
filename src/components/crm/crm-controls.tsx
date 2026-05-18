"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, MessageSquarePlus, UserPlus, Tags } from "lucide-react";
import { toast } from "sonner";

import {
  sendMessage,
  updateContactStage,
  createContact,
} from "@/lib/actions/crm";
import {
  CONTACT_ETAPA,
  ETAPA_LABEL,
  CONTACT_FUENTE,
  FUENTE_LABEL,
} from "@/lib/validation/crm";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const selectCls =
  "border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2";

export function MessageComposer({
  conversationId,
  templates,
}: {
  conversationId: string;
  templates: { id: string; nombre: string; cuerpo: string }[];
}) {
  const [val, setVal] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    if (!val.trim()) return;
    start(async () => {
      const r = await sendMessage({
        conversation_id: conversationId,
        contenido: val,
      });
      if (r.ok) {
        setVal("");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <div className="bg-background border-t p-3">
      {templates.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-xs">
            <MessageSquarePlus className="size-3.5" />
            Plantillas
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-w-xs">
            {templates.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onSelect={() => setVal(t.cuerpo)}
              >
                {t.nombre}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={2}
          placeholder="Escribí un mensaje… (⌘↵ para enviar)"
          className="border-input bg-background focus-visible:ring-ring max-h-40 flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2"
        />
        <Button onClick={submit} disabled={pending || !val.trim()} size="icon-lg">
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function ContactStageMenu({
  contactId,
  etapa,
}: {
  contactId: string;
  etapa: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        className="bg-accent text-accent-foreground inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-medium"
      >
        <Tags className="size-3" />
        {ETAPA_LABEL[etapa as keyof typeof ETAPA_LABEL] ?? etapa}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {CONTACT_ETAPA.map((e) => (
          <DropdownMenuItem
            key={e}
            onSelect={() =>
              start(async () => {
                const r = await updateContactStage(contactId, e);
                if (r.ok) router.refresh();
                else toast.error(r.error);
              })
            }
          >
            {ETAPA_LABEL[e]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NewContactDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <UserPlus className="size-3.5" />
            Nuevo contacto
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo contacto</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) =>
            start(async () => {
              const r = await createContact(Object.fromEntries(fd));
              if (r.ok) {
                toast.success("Contacto creado");
                setOpen(false);
                router.refresh();
              } else toast.error(r.error);
            })
          }
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fuente">Fuente</Label>
              <select id="fuente" name="fuente" className={selectCls} defaultValue="whatsapp">
                {CONTACT_FUENTE.map((f) => (
                  <option key={f} value={f}>
                    {FUENTE_LABEL[f]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notas">Notas</Label>
            <Input id="notas" name="notas" />
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
