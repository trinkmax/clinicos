import type { Metadata } from "next";
import Image from "next/image";
import { Palette } from "lucide-react";

import { getTenant } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { BrandForm, type BrandInitial } from "@/components/admin/brand-form";

export const metadata: Metadata = { title: "Ajustes · Marca" };

export default async function AjustesMarcaPage() {
  const tenant = await getTenant();
  const branding = (tenant?.branding ?? {}) as Record<string, string>;
  const initial: BrandInitial = {
    logo_url: branding.logo_url,
    tagline: branding.tagline,
    phone: branding.phone,
    email: branding.email,
    website: branding.website,
    address: branding.address,
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-5">
        <header className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-lg">
            <Palette className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Identidad visual y contacto
            </h2>
            <p className="text-muted-foreground text-xs">
              Aparece en pies de página, comprobantes y comunicación con
              pacientes.
            </p>
          </div>
        </header>

        {initial.logo_url ? (
          <div className="ring-foreground/8 flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5 ring-1">
            <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
              Vista previa
            </span>
            <span className="ml-auto h-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={initial.logo_url}
                alt="Logo de la clínica"
                className="h-10 w-auto object-contain"
              />
            </span>
          </div>
        ) : null}

        <BrandForm initial={initial} />
      </Card>
    </div>
  );
}
// Mantengo Image importado para futura migración al optimizador local (next/image)
// — cuando subamos logos a Storage en vez de URL externa.
void Image;
