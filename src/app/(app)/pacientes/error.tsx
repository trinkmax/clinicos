"use client";

import { RouteError } from "@/components/shell/route-error";

export default function PacientesError({
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
      title="No pudimos cargar pacientes"
      description="Hubo un problema con el listado. Reintentá o usá la búsqueda directa."
    />
  );
}
