import type { ReactNode } from "react";
import { Settings } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { PageHeader } from "@/components/ui/page-header";
import { RouteTabs } from "@/components/ui/route-tabs";

const TABS = [
  { id: "clinica", href: "/ajustes", label: "Clínica", exact: true },
  { id: "marca", href: "/ajustes/marca", label: "Marca" },
  { id: "equipo", href: "/ajustes/equipo", label: "Equipo" },
  {
    id: "integraciones",
    href: "/ajustes/integraciones",
    label: "Integraciones",
  },
  { id: "bitacora", href: "/ajustes/bitacora", label: "Bitácora" },
];

export default async function AjustesLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole([ROLES.owner, ROLES.admin]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow={
          <>
            <Settings className="size-3" />
            Sistema
          </>
        }
        title="Ajustes"
        description="Clínica, marca, equipo, integraciones y bitácora de auditoría."
        size="lg"
      />

      <RouteTabs items={TABS} />

      <section className="pt-2">{children}</section>
    </div>
  );
}
