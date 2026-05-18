"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Check,
  Copy,
  Loader2,
  MessageCircle,
  Plug,
  QrCode,
  RefreshCw,
  Trash2,
  TriangleAlert,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  createChannel,
  saveMetaConfig,
  reconnectChannel,
  deleteChannel,
} from "@/lib/actions/channels";
import {
  CHANNEL_TIPO_LABEL,
  CHANNEL_ESTADO_LABEL,
} from "@/lib/validation/channels";
import type { ChannelView } from "@/lib/data/channels";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";

const ESTADO_DOT: Record<string, string> = {
  conectado: "bg-success",
  pendiente: "bg-warning",
  desconectado: "bg-muted-foreground",
  error: "bg-destructive",
};
const ESTADO_BADGE: Record<string, string> = {
  conectado: "bg-success/12 text-success",
  pendiente: "bg-warning/15 text-warning-foreground",
  desconectado: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive",
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          toast.success(`${label} copiado`);
          setTimeout(() => setDone(false), 1600);
        } catch {
          toast.error("No se pudo copiar");
        }
      }}
      className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors"
      aria-label={`Copiar ${label}`}
    >
      {done ? (
        <Check className="text-success size-3.5" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}

export function Connections({
  channels,
  webhookUrl,
  verifyTokenSet,
}: {
  channels: ChannelView[];
  webhookUrl: string;
  verifyTokenSet: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // En vivo: el worker escribe QR/estado en `channels` → repintar al instante.
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel("settings:channels")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channels" },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [router]);

  function add(tipo: "whatsapp_baileys" | "whatsapp_cloud") {
    start(async () => {
      const r = await createChannel({
        tipo,
        nombre:
          tipo === "whatsapp_baileys"
            ? "WhatsApp principal"
            : "WhatsApp API (Meta)",
      });
      if (r.ok) {
        toast.success("Canal creado");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Plug className="text-muted-foreground size-4" />
          Conexiones · WhatsApp
        </h2>
        {channels.length > 0 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => add("whatsapp_baileys")}
            >
              <QrCode className="size-4" /> QR
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => add("whatsapp_cloud")}
            >
              <Webhook className="size-4" /> Meta API
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-primary/[0.03] border-primary/15 flex gap-3 p-4 text-sm">
        <MessageCircle className="text-primary mt-0.5 size-4 shrink-0" />
        <p className="text-muted-foreground leading-relaxed">
          La conexión la mantiene el{" "}
          <span className="text-foreground font-medium">
            worker de WhatsApp
          </span>{" "}
          — un servicio Node always-on (Railway/Fly), separado de la app. El QR
          y los envíos los maneja él. Si el QR no aparece en unos segundos, el
          worker no está corriendo.
        </p>
      </Card>

      {channels.length === 0 ? (
        <EmptyState
          icon={Plug}
          title="Sin canales conectados"
          description="Vinculá un WhatsApp por QR (Baileys) o conectá la API oficial de Meta Cloud para enviar y recibir mensajes en el Inbox."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                disabled={pending}
                onClick={() => add("whatsapp_baileys")}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <QrCode className="size-4" />
                )}
                Conectar WhatsApp (QR)
              </Button>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => add("whatsapp_cloud")}
              >
                <Webhook className="size-4" />
                WhatsApp API (Meta)
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4">
          {channels.map((c) => (
            <ChannelCard
              key={c.id}
              c={c}
              webhookUrl={webhookUrl}
              verifyTokenSet={verifyTokenSet}
              pending={pending}
              onReconnect={() =>
                start(async () => {
                  const r = await reconnectChannel(c.id);
                  if (r.ok) {
                    toast.success("Reiniciando vinculación…");
                    router.refresh();
                  } else toast.error(r.error);
                })
              }
              onDelete={() =>
                start(async () => {
                  const r = await deleteChannel(c.id);
                  if (r.ok) {
                    toast.success("Canal eliminado");
                    router.refresh();
                  } else toast.error(r.error);
                })
              }
              onSaveMeta={(fd) =>
                start(async () => {
                  const r = await saveMetaConfig({
                    id: c.id,
                    phone_number_id: fd.get("phone_number_id"),
                    waba_id: fd.get("waba_id"),
                    graph_token: fd.get("graph_token"),
                    graph_version: fd.get("graph_version") || "v21.0",
                  });
                  if (r.ok) {
                    toast.success("Credenciales guardadas");
                    router.refresh();
                  } else toast.error(r.error);
                })
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ChannelCard({
  c,
  webhookUrl,
  verifyTokenSet,
  pending,
  onReconnect,
  onDelete,
  onSaveMeta,
}: {
  c: ChannelView;
  webhookUrl: string;
  verifyTokenSet: boolean;
  pending: boolean;
  onReconnect: () => void;
  onDelete: () => void;
  onSaveMeta: (fd: FormData) => void;
}) {
  const isBaileys = c.tipo === "whatsapp_baileys";
  const connected = c.estado === "conectado";

  return (
    <Card className="hairline-top gap-0 overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary ring-primary/15 grid size-10 place-items-center rounded-xl ring-1">
            {isBaileys ? (
              <QrCode className="size-5" />
            ) : (
              <Webhook className="size-5" />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">
              {c.nombre}
            </p>
            <p className="text-muted-foreground text-xs">
              {CHANNEL_TIPO_LABEL[c.tipo] ?? c.tipo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
              ESTADO_BADGE[c.estado],
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                ESTADO_DOT[c.estado],
                connected && "animate-pulse-ring",
              )}
            />
            {CHANNEL_ESTADO_LABEL[c.estado] ?? c.estado}
          </span>
          <button
            onClick={onDelete}
            disabled={pending}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 grid size-7 place-items-center rounded-md transition-colors disabled:opacity-50"
            aria-label="Eliminar canal"
            title="Eliminar canal"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {isBaileys ? (
        <div className="border-t px-5 py-5">
          {connected ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="bg-success/12 text-success grid size-12 place-items-center rounded-2xl">
                <Check className="size-6" />
              </span>
              <div>
                <p className="text-sm font-medium">WhatsApp vinculado</p>
                <p className="text-muted-foreground text-xs">
                  Enviando y recibiendo en el Inbox.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={onReconnect}
              >
                <RefreshCw className="size-3.5" />
                Reconectar / cambiar número
              </Button>
            </div>
          ) : c.qr ? (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-2xl border bg-white p-3 shadow-sm">
                <Image
                  src={c.qr}
                  alt="Código QR para vincular WhatsApp"
                  width={216}
                  height={216}
                  unoptimized
                  className="size-54 rounded-md"
                />
              </div>
              <ol className="text-muted-foreground max-w-xs space-y-1 text-xs leading-relaxed">
                <li>
                  1. Abrí WhatsApp en el teléfono de la clínica →{" "}
                  <span className="text-foreground">
                    Dispositivos vinculados
                  </span>
                  .
                </li>
                <li>
                  2. Tocá <span className="text-foreground">Vincular un dispositivo</span> y escaneá este código.
                </li>
              </ol>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={onReconnect}
              >
                <RefreshCw className="size-3.5" />
                Generar QR nuevo
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Loader2 className="text-muted-foreground size-6 animate-spin" />
              <div>
                <p className="text-sm font-medium">
                  Esperando el QR del worker…
                </p>
                <p className="text-muted-foreground mx-auto mt-1 max-w-xs text-xs leading-relaxed">
                  El worker genera el código al detectar este canal. Si no
                  aparece, verificá que el servicio esté corriendo
                  (`cd worker && pnpm dev`, o el deploy en Railway/Fly).
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={onReconnect}
              >
                <RefreshCw className="size-3.5" />
                Reintentar
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 border-t px-5 py-5">
          <form
            action={onSaveMeta}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-1.5">
              <Label htmlFor={`pnid-${c.id}`}>Phone Number ID</Label>
              <Input
                id={`pnid-${c.id}`}
                name="phone_number_id"
                inputMode="numeric"
                placeholder="1234567890"
                defaultValue={c.phone_number_id ?? ""}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`waba-${c.id}`}>
                WABA ID{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Input
                id={`waba-${c.id}`}
                name="waba_id"
                placeholder="WhatsApp Business Account ID"
                defaultValue={c.waba_id ?? ""}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`tok-${c.id}`}>
                Token de la Graph API
                {c.hasToken && (
                  <span className="text-success ml-2 text-[11px] font-normal">
                    · ya configurado (dejá vacío para mantenerlo)
                  </span>
                )}
              </Label>
              <Input
                id={`tok-${c.id}`}
                name="graph_token"
                type="password"
                placeholder={
                  c.hasToken ? "•••••••••• (sin cambios)" : "EAAG…"
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`ver-${c.id}`}>Versión Graph</Label>
              <Input
                id={`ver-${c.id}`}
                name="graph_version"
                placeholder="v21.0"
                defaultValue={c.graph_version ?? "v21.0"}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={pending}
                className="w-full sm:w-auto"
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                Guardar credenciales
              </Button>
            </div>
          </form>

          <div className="bg-muted/40 space-y-2.5 rounded-lg border p-3.5">
            <p className="text-[11px] font-semibold tracking-wide uppercase">
              Webhook (configurar en Meta → WhatsApp → Configuración)
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-background flex-1 truncate rounded-md border px-2.5 py-1.5 font-mono text-xs">
                {webhookUrl}
              </code>
              <CopyButton value={webhookUrl} label="URL del webhook" />
            </div>
            <p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
              {verifyTokenSet ? (
                <Check className="text-success mt-0.5 size-3.5 shrink-0" />
              ) : (
                <TriangleAlert className="text-warning mt-0.5 size-3.5 shrink-0" />
              )}
              <span>
                Verify token: usá el valor de la variable de entorno{" "}
                <code className="font-mono">META_VERIFY_TOKEN</code>
                {verifyTokenSet
                  ? " (ya seteada en el servidor)."
                  : " — todavía no está seteada en el servidor."}{" "}
                Suscribí el campo <code className="font-mono">messages</code>.
              </span>
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
