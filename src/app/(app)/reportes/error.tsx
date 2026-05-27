"use client";

import { RouteError } from "@/components/shell/route-error";

export default function ReportesError({
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
      title="No pudimos cargar los reportes"
      description="Hubo un problema con el cálculo de indicadores. Reintentá."
    />
  );
}
