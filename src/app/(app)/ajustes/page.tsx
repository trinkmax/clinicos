import type { Metadata } from "next";
import { Building2, Globe, Languages } from "lucide-react";

import { getTenant } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { TenantNameForm } from "@/components/admin/team-controls";

export const metadata: Metadata = { title: "Ajustes · Clínica" };

export default async function AjustesClinicaPage() {
  const tenant = await getTenant();

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-5">
        <header className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
            <Building2 className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Identidad de la clínica
            </h2>
            <p className="text-muted-foreground text-xs">
              Nombre que ven el equipo y los pacientes en comprobantes.
            </p>
          </div>
        </header>
        {tenant && <TenantNameForm name={tenant.name} />}
      </Card>

      <Card className="space-y-3 p-5">
        <header className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
            <Globe className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Localización
            </h2>
            <p className="text-muted-foreground text-xs">
              Configurada por tenant. Cambios afectan a todo el equipo.
            </p>
          </div>
        </header>
        <dl className="text-sm grid gap-3 sm:grid-cols-2">
          <Field
            icon={<Globe className="size-4" />}
            label="Zona horaria"
            value={tenant?.timezone ?? "America/Argentina/Buenos_Aires"}
          />
          <Field
            icon={<Languages className="size-4" />}
            label="Idioma"
            value={tenant?.locale === "es-AR" ? "Español (Argentina)" : tenant?.locale ?? "es-AR"}
          />
        </dl>
      </Card>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="ring-foreground/8 flex items-center gap-3 rounded-lg bg-card/40 px-3 py-2.5 ring-1">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-foreground truncate text-sm">{value}</p>
      </div>
    </div>
  );
}
