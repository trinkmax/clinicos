import type { Metadata } from "next";
import {
  CircleUser,
  Languages,
  Lock,
  Palette,
  UserRound,
} from "lucide-react";

import { requireTenant } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  NameForm,
  PasswordForm,
} from "@/components/admin/profile-forms";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const ctx = await requireTenant();
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("full_name, status")
    .eq("user_id", ctx.userId)
    .eq("tenant_id", ctx.tenantId)
    .maybeSingle();
  const fullName = (data?.full_name as string | null) ?? "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow={
          <>
            <CircleUser className="size-3" />
            Cuenta
          </>
        }
        title="Mi perfil"
        description="Gestioná tus datos personales, contraseña y preferencias de la app."
        size="lg"
      />

      <Card className="space-y-4 p-5">
        <header className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
            <UserRound className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Datos personales
            </h2>
            <p className="text-muted-foreground text-xs">
              Tu nombre se muestra en el equipo y en la bitácora.
            </p>
          </div>
          <span className="ml-auto text-muted-foreground text-xs">
            {ROLE_LABELS[ctx.role]}
          </span>
        </header>
        <NameForm initialName={fullName} email={ctx.email} />
      </Card>

      <Card className="space-y-4 p-5">
        <header className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
            <Lock className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Seguridad</h2>
            <p className="text-muted-foreground text-xs">
              Cambiá tu contraseña. Mínimo 8 caracteres.
            </p>
          </div>
        </header>
        <PasswordForm />
      </Card>

      <Card className="space-y-4 p-5">
        <header className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
            <Palette className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Preferencias
            </h2>
            <p className="text-muted-foreground text-xs">
              Tema visual e idioma de la interfaz.
            </p>
          </div>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">Tema</p>
            <ThemeToggle />
          </div>
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">Idioma</p>
            <div className="text-muted-foreground inline-flex items-center gap-2 rounded-lg border px-3 h-9 text-sm">
              <Languages className="size-4" />
              Español (Argentina)
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
