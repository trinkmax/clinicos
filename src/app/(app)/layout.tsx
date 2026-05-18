import type { ReactNode } from "react";

import { requireTenant } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppTopbar } from "@/components/shell/app-topbar";
import { CommandMenu } from "@/components/shell/command-menu";
import { PageTransition } from "@/components/motion/page-transition";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const ctx = await requireTenant();

  // Nombre para mostrar — degrada con elegancia si el Data API aún no responde.
  let fullName: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("memberships")
      .select("full_name")
      .eq("user_id", ctx.userId)
      .eq("tenant_id", ctx.tenantId)
      .maybeSingle();
    fullName = (data?.full_name as string | null) ?? null;
  } catch {
    /* sin perfil aún: se usa el email */
  }

  return (
    <SidebarProvider>
      <AppSidebar role={ctx.role} email={ctx.email} fullName={fullName} />
      <SidebarInset className="bg-aurora flex min-h-dvh flex-col">
        <AppTopbar />
        <main className="flex-1 p-4 sm:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </SidebarInset>
      <CommandMenu role={ctx.role} />
    </SidebarProvider>
  );
}
