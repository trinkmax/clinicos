"use client";

import { RouteError } from "@/components/shell/route-error";

export default function AutomatizacionesError({
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
      title="No pudimos cargar automatizaciones"
      description="Falló al traer triggers y acciones. Reintentá."
    />
  );
}
