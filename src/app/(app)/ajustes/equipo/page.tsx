import type { Metadata } from "next";
import { Users } from "lucide-react";

import { listMembers } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import {
  InviteMemberDialog,
  MemberRoleMenu,
  MemberStatusToggle,
} from "@/components/admin/team-controls";

export const metadata: Metadata = { title: "Ajustes · Equipo" };

export default async function AjustesEquipoPage() {
  const members = await listMembers();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Users className="text-muted-foreground size-4" />
          Equipo ({members.length})
        </h2>
        <InviteMemberDialog />
      </div>
      <Card className="overflow-hidden p-0">
        {members.length === 0 ? (
          <p className="text-muted-foreground p-8 text-center text-sm">
            Aún no invitaste miembros al equipo.
          </p>
        ) : (
          <ul className="divide-y">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5"
              >
                <div className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold">
                  {(m.full_name ?? m.email ?? "US").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.full_name ?? m.email ?? "Usuario"}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {m.email ?? m.user_id}
                  </p>
                </div>
                <MemberRoleMenu membershipId={m.id} role={m.role} />
                <MemberStatusToggle
                  membershipId={m.id}
                  status={m.status}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
