"use client";

import { RouteError } from "@/components/shell/route-error";

export default function MaxsexError({
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
      title="No pudimos cargar Maxsex"
      description="Falló al traer el catálogo. Reintentá."
    />
  );
}
