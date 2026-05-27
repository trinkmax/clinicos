"use client";

import { RouteError } from "@/components/shell/route-error";

export default function TurneroError({
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
      title="No pudimos cargar el turnero"
      description="No se pudo traer la agenda. Probemos de nuevo en un momento."
    />
  );
}
