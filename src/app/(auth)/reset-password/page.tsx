import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
        <Link
          href="/forgot-password"
          className={cn(buttonVariants(), "w-full")}
        >
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  return <ResetForm email={user.email ?? ""} />;
}
