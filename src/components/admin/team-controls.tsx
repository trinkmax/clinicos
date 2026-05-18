"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Power, Save } from "lucide-react";
import { toast } from "sonner";

import {
  inviteMember,
  updateMemberRole,
  setMemberStatus,
  updateTenantName,
} from "@/lib/actions/admin";
import { ALL_ROLES, ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const selectCls =
  "border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2";

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <UserPlus className="size-3.5" />
            Invitar usuario
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invitar / vincular usuario</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) =>
            start(async () => {
              const r = await inviteMember(Object.fromEntries(fd));
              if (r.ok) {
                toast.success(
                  r.data.tempPassword
                    ? `Usuario creado. Contraseña temporal: ${r.data.tempPassword}`
                    : "Usuario existente vinculado a la clínica",
                  { duration: 12000 },
                );
                setOpen(false);
                router.refresh();
              } else toast.error(r.error);
            })
          }
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nombre</Label>
            <Input id="full_name" name="full_name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Rol</Label>
            <select id="role" name="role" className={selectCls} defaultValue="recepcion">
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Invitar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MemberRoleMenu({
  membershipId,
  role,
}: {
  membershipId: string;
  role: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        className="bg-accent text-accent-foreground inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium"
      >
        {ROLE_LABELS[role as Role] ?? role}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ALL_ROLES.map((r) => (
          <DropdownMenuItem
            key={r}
            onSelect={() =>
              start(async () => {
                const res = await updateMemberRole(membershipId, r);
                if (res.ok) {
                  toast.success("Rol actualizado");
                  router.refresh();
                } else toast.error(res.error);
              })
            }
          >
            {ROLE_LABELS[r]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MemberStatusToggle({
  membershipId,
  status,
}: {
  membershipId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const active = status === "active";
  return (
    <Button
      size="sm"
      variant={active ? "ghost" : "outline"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await setMemberStatus(
            membershipId,
            active ? "disabled" : "active",
          );
          if (r.ok) {
            toast.success(active ? "Acceso revocado" : "Acceso restaurado");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Power className="size-3.5" />
      )}
      {active ? "Activo" : "Inactivo"}
    </Button>
  );
}

export function TenantNameForm({ name }: { name: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await updateTenantName(Object.fromEntries(fd));
          if (r.ok) {
            toast.success("Clínica actualizada");
            router.refresh();
          } else toast.error(r.error);
        })
      }
      className="flex items-end gap-3"
    >
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="name">Nombre de la clínica</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Guardar
      </Button>
    </form>
  );
}
