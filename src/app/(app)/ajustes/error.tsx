"use client";

import { RouteError } from "@/components/shell/route-error";

export default function AjustesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="No pudimos cargar ajustes"
      description="Falló al traer la configuración. Reintentá en un momento."
    />
  );
}
