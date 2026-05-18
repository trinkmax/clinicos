import type { Metadata } from "next";
import { Building2, Users, ScrollText } from "lucide-react";

import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { listMembers, getTenant, recentAudit } from "@/lib/data/admin";
import { listChannels } from "@/lib/data/channels";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Connections } from "@/components/settings/connections";
import {
  InviteMemberDialog,
  MemberRoleMenu,
  MemberStatusToggle,
  TenantNameForm,
} from "@/components/admin/team-controls";

export const metadata: Metadata = { title: "Ajustes" };

export default async function AjustesPage() {
  await requireRole([ROLES.owner, ROLES.admin]);
  const [members, tenant, audit, channels] = await Promise.all([
    listMembers(),
    getTenant(),
    recentAudit(40),
    listChannels(),
  ]);

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "https://tu-dominio.com"
  ).replace(/\/$/, "");
  const webhookUrl = `${appUrl}/api/webhooks/meta`;
  const verifyTokenSet = Boolean(process.env.META_VERIFY_TOKEN);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Clínica, equipo y bitácora de auditoría
        </p>
      </header>

      <Card className="space-y-4 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="text-muted-foreground size-4" />
          Clínica
        </h2>
        {tenant && <TenantNameForm name={tenant.name} />}
      </Card>

      <Connections
        channels={channels}
        webhookUrl={webhookUrl}
        verifyTokenSet={verifyTokenSet}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Users className="text-muted-foreground size-4" />
            Equipo ({members.length})
          </h2>
          <InviteMemberDialog />
        </div>
        <Card className="overflow-hidden p-0">
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
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ScrollText className="text-muted-foreground size-4" />
          Bitácora de auditoría (Ley 26.529)
        </h2>
        <Card className="overflow-hidden p-0">
          {audit.length === 0 ? (
            <p className="text-muted-foreground p-8 text-center text-sm">
              Sin eventos auditados todavía.
            </p>
          ) : (
            <ul className="divide-y text-sm">
              {audit.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5"
                >
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {a.action}
                  </Badge>
                  <span className="text-muted-foreground font-mono text-xs">
                    {a.entity_table}
                  </span>
                  <span className="flex-1" />
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {new Date(a.created_at).toLocaleString("es-AR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
