"use client";

import { RouteError } from "@/components/shell/route-error";

export default function MarketingError({
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
      title="No pudimos cargar marketing"
      description="Falló al traer segmentos, campañas o atribución. Reintentá."
    />
  );
}
