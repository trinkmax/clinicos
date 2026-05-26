"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  UserPlus,
  Power,
  Save,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
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

/** Password aleatoria URL-safe (~12 chars). Coincide con la lógica server-side. */
function generatePassword(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();

  function resetForm() {
    setPassword("");
    setShowPwd(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm">
            <UserPlus className="size-3.5" />
            Nuevo usuario
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
        </DialogHeader>
        <form
          action={(fd) =>
            start(async () => {
              const r = await inviteMember(Object.fromEntries(fd));
              if (!r.ok) {
                toast.error(r.error);
                return;
              }
              const tmp = r.data.tempPassword;
              if (tmp && r.data.generated) {
                toast.success(
                  `Usuario creado. Contraseña generada: ${tmp}`,
                  {
                    duration: Infinity,
                    action: {
                      label: "Copiar",
                      onClick: () => navigator.clipboard.writeText(tmp),
                    },
                  },
                );
              } else if (tmp) {
                toast.success("Usuario creado con la contraseña indicada.");
              } else {
                toast.success("Usuario existente vinculado a la clínica.");
              }
              setOpen(false);
              router.refresh();
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
            <select
              id="role"
              name="role"
              className={selectCls}
              defaultValue="recepcion"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <button
                type="button"
                onClick={() => {
                  setPassword(generatePassword());
                  setShowPwd(true);
                }}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] font-medium transition-colors"
              >
                <Sparkles className="size-3" />
                Generar
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="pr-10 font-mono tracking-tight"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={
                  showPwd ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 p-1 transition-colors"
              >
                {showPwd ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Dejá vacío para que el sistema genere una contraseña aleatoria.
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Crear usuario
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
