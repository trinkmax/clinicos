import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="space-y-5 text-center">
        <p className="text-primary text-7xl font-semibold tracking-tighter">
          404
        </p>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">
            Página no encontrada
          </h1>
          <p className="text-muted-foreground text-sm">
            La página que buscás no existe o fue movida.
          </p>
        </div>
        <Button render={<Link href="/" />}>Volver al inicio</Button>
      </div>
    </div>
  );
}
