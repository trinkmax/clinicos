"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarPlus,
  Loader2,
  MessageSquare,
  Receipt,
  Sparkles,
  UserPlus,
  Wallet,
  User as UserIcon,
} from "lucide-react";

import { navForRole } from "@/config/nav";
import type { Role } from "@/lib/auth/roles";
import { ROLES, hasAnyRole } from "@/lib/auth/roles";
import { searchEntities, type SearchHit } from "@/lib/actions/search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface QuickAction {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: typeof UserPlus;
  roles: readonly Role[];
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "new-patient",
    label: "Nuevo paciente",
    hint: "Alta y ficha inicial",
    href: "/pacientes?nuevo=1",
    icon: UserPlus,
    roles: [ROLES.owner, ROLES.admin, ROLES.recepcion, ROLES.profesional],
  },
  {
    id: "new-appointment",
    label: "Nuevo turno",
    hint: "Agendar consulta o aplicación",
    href: "/turnero?nuevo=1",
    icon: CalendarPlus,
    roles: [ROLES.owner, ROLES.admin, ROLES.recepcion, ROLES.profesional],
  },
  {
    id: "register-payment",
    label: "Registrar pago",
    hint: "Cobranza sobre un plan existente",
    href: "/comercial?tab=planes",
    icon: Wallet,
    roles: [ROLES.owner, ROLES.admin, ROLES.comercial],
  },
  {
    id: "new-plan",
    label: "Nuevo plan FIC",
    hint: "Producto, descuento y plan de pagos",
    href: "/comercial?nuevo=1",
    icon: Receipt,
    roles: [ROLES.owner, ROLES.admin, ROLES.comercial],
  },
  {
    id: "open-inbox",
    label: "Ir al inbox",
    hint: "WhatsApp y Facebook unificados",
    href: "/inbox",
    icon: MessageSquare,
    roles: [
      ROLES.owner,
      ROLES.admin,
      ROLES.marketing,
      ROLES.comercial,
      ROLES.recepcion,
    ],
  },
];

const TYPE_ICON = {
  patient: UserIcon,
  conversation: MessageSquare,
  plan: Receipt,
} as const;

const TYPE_LABEL = {
  patient: "Pacientes",
  conversation: "Conversaciones",
  plan: "Planes",
} as const;

export function CommandMenu({ role }: { role: Role | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  const groups = useMemo(() => navForRole(role), [role]);
  const actions = useMemo(
    () =>
      role
        ? QUICK_ACTIONS.filter((a) => hasAnyRole(role, a.roles))
        : [],
    [role],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Reset cuando cierra (sin useEffect: react-hooks/set-state-in-effect)
  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setQ("");
      setHits([]);
      setSearching(false);
    }
  }, []);

  // Server search con debounce
  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      // No usamos setState acá: el escenario "q corto" se maneja con cleanup
      // del run anterior + estado derivado en el render.
      return;
    }
    let cancelled = false;
    // Marca "buscando…" mientras espera el debounce. Es flag de UI in-flight,
    // no genera cascading porque dispara un solo paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearching(true);
    const tid = setTimeout(async () => {
      try {
        const data = await searchEntities(trimmed);
        if (!cancelled) setHits(data);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(tid);
    };
  }, [q]);

  // Cuando q vuelve a ser corto, limpiamos hits via handler en el Input
  // (no en effect — evita el cascading render).

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  // Agrupar hits por tipo
  const hitsByType = hits.reduce<Record<string, SearchHit[]>>((acc, h) => {
    (acc[h.type] ??= []).push(h);
    return acc;
  }, {});

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Buscar"
      description="Navegá y buscá pacientes, conversaciones y planes"
    >
      <CommandInput
        placeholder="Buscar pacientes, conversaciones, acciones…"
        value={q}
        onValueChange={(value) => {
          setQ(value);
          if (value.trim().length < 2 && hits.length > 0) {
            setHits([]);
            setSearching(false);
          }
        }}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? (
            <span className="text-muted-foreground inline-flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" /> Buscando…
            </span>
          ) : q.trim().length >= 2 ? (
            "Sin resultados."
          ) : (
            "Empezá a escribir para buscar."
          )}
        </CommandEmpty>

        {/* Resultados de búsqueda — visibles solo si hay query con texto */}
        {Object.entries(hitsByType).map(([type, items]) => {
          const Icon = TYPE_ICON[type as keyof typeof TYPE_ICON];
          return (
            <CommandGroup
              key={type}
              heading={TYPE_LABEL[type as keyof typeof TYPE_LABEL]}
            >
              {items.map((it) => (
                <CommandItem
                  key={`${it.type}-${it.id}`}
                  value={`${it.title} ${it.subtitle} ${it.type}`}
                  onSelect={() => go(it.href)}
                >
                  <Icon className="size-4" />
                  <div className="min-w-0">
                    <p className="truncate text-sm">{it.title}</p>
                    <p className="text-muted-foreground truncate text-[11px]">
                      {it.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="text-muted-foreground ml-auto size-3.5" />
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}

        {hits.length > 0 && q.trim().length >= 2 ? <CommandSeparator /> : null}

        {actions.length > 0 && (
          <CommandGroup heading="Acciones rápidas">
            {actions.map((a) => (
              <CommandItem
                key={a.id}
                value={`${a.label} ${a.hint}`}
                onSelect={() => go(a.href)}
              >
                <a.icon className="size-4" />
                <span>{a.label}</span>
                <span className="text-muted-foreground ml-auto text-xs">
                  {a.hint}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {groups.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.title} ${item.description}`}
                onSelect={() => go(item.href)}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
                <span className="text-muted-foreground ml-auto text-xs">
                  {item.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {q.trim().length === 0 && actions.length === 0 && (
          <div className="text-muted-foreground flex items-center gap-2 px-3 py-2.5 text-xs">
            <Sparkles className="size-3.5" />
            Tip: probá escribir un apellido, DNI o un teléfono.
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
