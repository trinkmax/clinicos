import { requireTenant } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { getDashboard } from "@/lib/data/dashboard";
import { listChannels } from "@/lib/data/channels";
import { DashboardView } from "@/components/dashboard/dashboard-view";

function greetingPrefix(): string {
  const h = Number(
    new Intl.DateTimeFormat("es-AR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date()),
  );
  if (h < 12) return "Buen día";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function firstName(full: string | null, email: string | null): string {
  if (full) {
    const n = full.trim().split(/\s+/)[0];
    if (n) return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
  }
  if (email) {
    const local = email.split("@")[0] ?? "";
    const clean = local.replace(/[._-]+/g, " ").trim().split(/\s+/)[0];
    if (clean) return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }
  return "Equipo";
}

export default async function DashboardPage() {
  const ctx = await requireTenant();
  const role = ctx.role;

  const supabase = await createClient();
  const [membershipRes, data, channels] = await Promise.all([
    supabase
      .from("memberships")
      .select("full_name")
      .eq("user_id", ctx.userId)
      .eq("tenant_id", ctx.tenantId)
      .maybeSingle(),
    role ? getDashboard(role) : Promise.resolve(null),
    listChannels().catch(() => []),
  ]);

  if (!role || !data) {
    return (
      <div className="text-muted-foreground mx-auto max-w-6xl py-20 text-center text-sm">
        Tu cuenta todavía no tiene un rol asignado. Pedile a un
        administrador que complete el alta.
      </div>
    );
  }

  const fullName = (membershipRes.data?.full_name as string | null) ?? null;
  const userName = firstName(fullName, ctx.email);

  // Estado del worker / canales para el "briefing operativo".
  const whatsappState =
    channels.find((c) => c.tipo.startsWith("whatsapp"))?.estado ?? "none";
  const metaState =
    channels.find((c) => c.tipo.includes("meta") || c.tipo.includes("facebook"))
      ?.estado ?? "none";

  return (
    <DashboardView
      data={data}
      role={role}
      roleLabel={ROLE_LABELS[role] ?? "Equipo"}
      greeting={greetingPrefix()}
      userName={userName}
      channels={{ whatsapp: whatsappState, meta: metaState }}
    />
  );
}
