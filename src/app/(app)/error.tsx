"use client";

import { RouteError } from "@/components/shell/route-error";

export default function AppError({
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
      title="No pudimos cargar esta sección"
      description="Algo falló mientras traíamos los datos. Reintentá o volvé al inicio."
    />
  );
}
