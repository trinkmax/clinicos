import type { Metadata } from "next";
import Link from "next/link";
import {
  MessagesSquare,
  Inbox as InboxIcon,
  Users,
  Phone,
} from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import {
  listConversations,
  getConversation,
  listContacts,
  listTemplates,
  crmStats,
} from "@/lib/data/crm";
import { FUENTE_LABEL } from "@/lib/validation/crm";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InboxRealtime } from "@/components/crm/inbox-realtime";
import { InboxView } from "@/components/crm/inbox-view";
import {
  MessageComposer,
  ContactStageMenu,
  NewContactDialog,
} from "@/components/crm/crm-controls";

export const metadata: Metadata = { title: "Inbox" };

const ESTADO_BADGE: Record<string, string> = {
  abierta: "bg-success/12 text-success",
  pendiente: "bg-warning/15 text-warning-foreground",
  cerrada: "bg-muted text-muted-foreground",
};

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "·";
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; view?: string }>;
}) {
  await requireRole([
    ROLES.owner,
    ROLES.admin,
    ROLES.marketing,
    ROLES.comercial,
    ROLES.recepcion,
  ]);
  const { c, view } = await searchParams;
  const isContactos = view === "contactos";

  const [conversations, stats, templates] = await Promise.all([
    listConversations(),
    crmStats(),
    listTemplates(),
  ]);
  const thread = c ? await getConversation(c) : null;
  const contacts = isContactos ? await listContacts() : [];
  const tplOpts = templates.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    cuerpo: t.cuerpo,
  }));

  const threadName =
    thread?.conversation.contact?.nombre ??
    thread?.conversation.contact?.telefono ??
    "Contacto";

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-7xl flex-col gap-4">
      <InboxRealtime />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {stats.convAbiertas} conversaciones abiertas · {stats.leads}{" "}
            leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted/60 flex items-center gap-1 rounded-lg p-1">
            <Link
              href="/inbox"
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                !isContactos
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <InboxIcon className="size-3.5" /> Conversaciones
            </Link>
            <Link
              href="/inbox?view=contactos"
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                isContactos
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="size-3.5" /> Contactos
            </Link>
          </div>
          <NewContactDialog />
        </div>
      </header>

      {isContactos ? (
        <Card className="flex-1 overflow-y-auto p-0">
          {contacts.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin contactos"
              description="Llegan por WhatsApp (worker) o por leads de Facebook/Google. También podés cargar uno manual."
              action={<NewContactDialog />}
              className="h-full"
            />
          ) : (
            <ul className="divide-y">
              {contacts.map((ct) => {
                const nm = ct.nombre ?? ct.telefono ?? "Contacto";
                return (
                  <li
                    key={ct.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5"
                  >
                    <span className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold">
                      {initials(nm)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{nm}</p>
                      <p className="text-muted-foreground text-xs">
                        {ct.telefono ?? "—"} ·{" "}
                        {FUENTE_LABEL[
                          ct.fuente as keyof typeof FUENTE_LABEL
                        ] ?? ct.fuente}
                      </p>
                    </div>
                    <ContactStageMenu contactId={ct.id} etapa={ct.etapa} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ) : (
        <Card className="grid flex-1 grid-cols-1 overflow-hidden p-0 lg:grid-cols-[360px_1fr]">
          {/* Lista + filtros */}
          <div
            className={cn(
              "min-h-0 border-r",
              thread && "hidden lg:block",
            )}
          >
            <InboxView conversations={conversations} activeId={c ?? null} />
          </div>

          {/* Hilo */}
          <div className="flex min-h-0 flex-col">
            {!thread ? (
              <EmptyState
                icon={MessagesSquare}
                title="Elegí una conversación"
                description="Seleccioná un chat de la lista para ver el historial y responder, o iniciá uno nuevo."
                action={<NewContactDialog />}
                className="h-full"
              />
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href="/inbox"
                      className="text-muted-foreground hover:text-foreground hover:bg-accent grid size-8 place-items-center rounded-lg lg:hidden"
                      aria-label="Volver"
                    >
                      ←
                    </Link>
                    <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-full text-xs font-semibold">
                      {initials(threadName)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold tracking-tight">
                        {threadName}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        {thread.conversation.contact?.telefono && (
                          <>
                            <Phone className="size-3" />
                            <span className="tabular-nums">
                              {thread.conversation.contact.telefono}
                            </span>
                            <span className="text-muted-foreground/40">
                              ·
                            </span>
                          </>
                        )}
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            ESTADO_BADGE[thread.conversation.estado],
                          )}
                        >
                          {thread.conversation.estado}
                        </span>
                      </p>
                    </div>
                  </div>
                  {thread.conversation.contact && (
                    <ContactStageMenu
                      contactId={thread.conversation.contact.id}
                      etapa={thread.conversation.contact.etapa}
                    />
                  )}
                </div>

                <div className="bg-dotgrid min-h-0 flex-1 space-y-2.5 overflow-y-auto p-5">
                  {thread.messages.length === 0 ? (
                    <p className="text-muted-foreground py-10 text-center text-sm">
                      Sin mensajes en esta conversación
                    </p>
                  ) : (
                    thread.messages.map((m) => {
                      const out = m.direccion === "out";
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "flex",
                            out ? "justify-end" : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-xs",
                              out
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-card rounded-bl-sm ring-1 ring-foreground/10",
                            )}
                          >
                            <p className="whitespace-pre-wrap">
                              {m.contenido}
                            </p>
                            <p
                              className={cn(
                                "mt-1 text-[10px] tabular-nums",
                                out
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground",
                              )}
                            >
                              {new Date(m.created_at).toLocaleTimeString(
                                "es-AR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                              {out && ` · ${m.estado}`}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <MessageComposer
                  conversationId={thread.conversation.id}
                  templates={tplOpts}
                />
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
