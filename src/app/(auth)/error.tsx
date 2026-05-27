"use client";

import { RouteError } from "@/components/shell/route-error";

export default function AuthError({
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
      title="No pudimos completar la operación"
      description="Algo salió mal con la autenticación. Reintentá o pedí ayuda."
      homeHref="/login"
    />
  );
}
