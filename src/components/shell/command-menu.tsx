"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { navForRole } from "@/config/nav";
import type { Role } from "@/lib/auth/roles";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CommandMenu({ role }: { role: Role | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const groups = navForRole(role);

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

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Buscar"
      description="Navegá por el sistema"
    >
      <CommandInput placeholder="Buscar módulo o acción…" />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
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
      </CommandList>
    </CommandDialog>
  );
}
