"use client";

import { RouteError } from "@/components/shell/route-error";

export default function InboxError({
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
      title="No pudimos cargar el inbox"
      description="Hubo un problema con conversaciones o contactos. Reintentá."
    />
  );
}
