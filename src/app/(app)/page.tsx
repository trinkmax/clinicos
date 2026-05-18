import { requireTenant } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { navForRole } from "@/config/nav";
import { getDashboard } from "@/lib/data/dashboard";
import { DashboardView } from "@/components/dashboard/dashboard-view";

function greeting() {
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

export default async function DashboardPage() {
  const ctx = await requireTenant();
  const role = ctx.role;

  const [data] = await Promise.all([role ? getDashboard(role) : null]);

  const modules = navForRole(role)
    .flatMap((g) => g.items)
    .filter((i) => i.href !== "/")
    .map((i) => ({
      title: i.title,
      href: i.href,
      description: i.description,
      phase: i.phase,
    }));

  if (!role || !data) {
    return (
      <div className="text-muted-foreground mx-auto max-w-6xl py-20 text-center text-sm">
        Tu cuenta todavía no tiene un rol asignado. Pedile al administrador que
        complete el alta.
      </div>
    );
  }

  return (
    <DashboardView
      data={data}
      role={role}
      roleLabel={ROLE_LABELS[role] ?? "Equipo"}
      greeting={greeting()}
      modules={modules}
    />
  );
}
