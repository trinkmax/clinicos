"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Plantilla de error-boundary reutilizable. Cada `error.tsx` por ruta importa
 * esto y le pasa títulos/microcopy del contexto del módulo. Loguea a la consola
 * del cliente — Supabase logs no captura client-side automáticamente.
 */
export function RouteError({
  error,
  reset,
  title = "Algo se rompió",
  description = "Tuvimos un problema cargando esta pantalla. Probemos de nuevo o volvé al inicio.",
  homeHref = "/",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  homeHref?: string;
}) {
  useEffect(() => {
    console.error("[clinicOS] route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-20 text-center">
      <div className="bg-destructive/10 text-destructive grid size-14 place-items-center rounded-2xl ring-1 ring-destructive/20">
        <AlertCircle className="size-7" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
      {error.digest ? (
        <p className="text-muted-foreground bg-muted/60 rounded-md px-2 py-1 font-mono text-[10px]">
          ref: {error.digest}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button onClick={reset} variant="default">
          <RefreshCw className="size-4" />
          Reintentar
        </Button>
        <Button variant="outline" render={<Link href={homeHref} />}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
