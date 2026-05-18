"use client";

import { useQueryState } from "nuqs";
import { useTransition } from "react";
import { Search, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";

export function PatientSearch() {
  const [pending, start] = useTransition();
  const [q, setQ] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    startTransition: start,
    throttleMs: 350,
  });

  return (
    <div className="relative max-w-sm flex-1">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre, DNI o teléfono…"
        className="h-10 pl-9"
        aria-label="Buscar paciente"
      />
      {pending && (
        <Loader2 className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
      )}
    </div>
  );
}
