"use client";

import { RouteError } from "@/components/shell/route-error";

export default function ComercialError({
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
      title="No pudimos cargar comercial"
      description="Falló al traer planes, pagos o entregas. Reintentá en un momento."
    />
  );
}
