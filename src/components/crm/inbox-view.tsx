"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MessageCircle, Inbox as InboxIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ETAPA_LABEL, FUENTE_LABEL } from "@/lib/validation/crm";
import type { ConversationListItem } from "@/lib/data/crm";

const ESTADO_DOT: Record<string, string> = {
  abierta: "bg-success",
  pendiente: "bg-warning",
  cerrada: "bg-muted-foreground",
};
const ESTADO_LABEL: Record<string, string> = {
  abierta: "Abierta",
  pendiente: "Pendiente",
  cerrada: "Cerrada",
};

const AVATAR_TINT = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
function tint(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_TINT[Math.abs(h) % AVATAR_TINT.length];
}
function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "·";
}
function timeAgo(iso: string | null) {
  if (!iso) return "";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d` : `${Math.floor(d / 7)}sem`;
}

const CHANNELS = [
  { id: "todos", label: "Todos" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "facebook", label: "Facebook" },
] as const;

export function InboxView({
  conversations,
  activeId,
}: {
  conversations: ConversationListItem[];
  activeId: string | null;
}) {
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<string>("todos");
  const [etapa, setEtapa] = useState<string>("todas");

  const etapas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of conversations) {
      const e = c.contact?.etapa;
      if (e) counts.set(e, (counts.get(e) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [conversations]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return conversations.filter((c) => {
      if (channel !== "todos" && c.contact?.fuente !== channel) {
        if (!(channel === "facebook" && c.contact?.fuente === "facebook"))
          return false;
      }
      if (etapa !== "todas" && c.contact?.etapa !== etapa) return false;
      if (needle) {
        const hay = `${c.contact?.nombre ?? ""} ${
          c.contact?.telefono ?? ""
        }`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [conversations, q, channel, etapa]);

  const total = conversations.length;

  return (
    <div className="flex h-full flex-col">
      {/* Tabs de canal */}
      <div className="flex items-center gap-1 px-3 pt-3">
        {CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setChannel(ch.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              channel === ch.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {ch.id === "whatsapp" && (
              <MessageCircle className="mr-1 inline size-3.5" />
            )}
            {ch.label}
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar o iniciar chat…"
            className="border-input bg-muted/40 focus-visible:ring-ring focus-visible:bg-background h-9 w-full rounded-lg border pr-3 pl-9 text-sm outline-none transition-colors focus-visible:ring-2"
          />
        </div>
      </div>

      {/* Chips de etapa */}
      {etapas.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip
            active={etapa === "todas"}
            onClick={() => setEtapa("todas")}
            label="Todas"
            count={total}
          />
          {etapas.map(([e, n]) => (
            <Chip
              key={e}
              active={etapa === e}
              onClick={() => setEtapa(e)}
              label={ETAPA_LABEL[e as keyof typeof ETAPA_LABEL] ?? e}
              count={n}
            />
          ))}
        </div>
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto border-t">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm">
            <InboxIcon className="size-7 opacity-60" />
            {total === 0
              ? "Sin conversaciones todavía"
              : "Nada coincide con el filtro"}
          </div>
        ) : (
          <ul>
            {filtered.map((cv) => {
              const name =
                cv.contact?.nombre ?? cv.contact?.telefono ?? "Contacto";
              const active = activeId === cv.id;
              return (
                <li key={cv.id}>
                  <Link
                    href={`/inbox?c=${cv.id}`}
                    scroll={false}
                    className={cn(
                      "group relative flex gap-3 px-3.5 py-3 transition-colors",
                      active
                        ? "bg-primary/[0.06]"
                        : "hover:bg-accent/50",
                    )}
                  >
                    {active && (
                      <span className="bg-primary absolute inset-y-2 left-0 w-[3px] rounded-full" />
                    )}
                    <span
                      className="relative grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                      style={{ background: tint(name) }}
                    >
                      {initials(name)}
                      {cv.unread > 0 && (
                        <span className="bg-primary ring-card absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white ring-2">
                          {cv.unread > 9 ? "9+" : cv.unread}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm",
                            cv.unread > 0
                              ? "font-semibold"
                              : "font-medium",
                          )}
                        >
                          {name}
                        </p>
                        <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">
                          {timeAgo(cv.last_message_at)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            ESTADO_DOT[cv.estado] ?? "bg-muted-foreground",
                          )}
                          title={ESTADO_LABEL[cv.estado] ?? cv.estado}
                        />
                        {cv.contact && (
                          <>
                            <span className="text-muted-foreground truncate text-[11px]">
                              {ETAPA_LABEL[
                                cv.contact
                                  .etapa as keyof typeof ETAPA_LABEL
                              ] ?? cv.contact.etapa}
                            </span>
                            <span className="text-muted-foreground/50 text-[11px]">
                              ·
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                              {FUENTE_LABEL[
                                cv.contact
                                  .fuente as keyof typeof FUENTE_LABEL
                              ] ?? cv.contact.fuente}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent border-transparent",
      )}
    >
      {label}
      <span
        className={cn(
          "tabular-nums",
          active ? "text-primary/70" : "text-muted-foreground/60",
        )}
      >
        {count}
      </span>
    </button>
  );
}
