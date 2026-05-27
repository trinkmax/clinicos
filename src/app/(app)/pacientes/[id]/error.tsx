"use client";

import { RouteError } from "@/components/shell/route-error";

export default function PacienteDetailError({
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
      title="No pudimos cargar el paciente"
      description="Probemos de nuevo o volvé al listado."
      homeHref="/pacientes"
    />
  );
}
