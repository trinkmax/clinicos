"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updateTenantBrand } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface BrandInitial {
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  tagline?: string;
}

export function BrandForm({ initial }: { initial: BrandInitial }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      action={(fd) =>
        start(async () => {
          const res = await updateTenantBrand(Object.fromEntries(fd));
          if (res.ok) {
            toast.success("Marca actualizada");
            router.refresh();
          } else {
            toast.error(res.error);
          }
        })
      }
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="logo_url">Logo (URL)</Label>
          <Input
            id="logo_url"
            name="logo_url"
            type="url"
            defaultValue={initial.logo_url ?? ""}
            placeholder="https://…/logo.png"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline (eslogan corto)</Label>
          <Input
            id="tagline"
            name="tagline"
            defaultValue={initial.tagline ?? ""}
            placeholder="Medicina sexual con evidencia"
            maxLength={180}
            className="h-10"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={initial.phone ?? ""}
            placeholder="+54 11 5555-1234"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email de contacto</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initial.email ?? ""}
            placeholder="hola@controlgroup.com"
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Sitio web</Label>
        <Input
          id="website"
          name="website"
          type="url"
          defaultValue={initial.website ?? ""}
          placeholder="https://controlgroup.com.ar"
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={initial.address ?? ""}
          placeholder="Av. Siempre Viva 123, CABA"
          rows={2}
          maxLength={240}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Guardar marca
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
