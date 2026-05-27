import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Enlace expirado
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Este enlace ya fue usado o caducó. Solicitá uno nuevo desde
          «Olvidé mi contraseña».
        </p>
        <Button render={<Link href="/forgot-password" />} className="w-full">
          Pedir un enlace nuevo
        </Button>
      </div>
    );
  }

  return <ResetForm email={user.email ?? ""} />;
}
