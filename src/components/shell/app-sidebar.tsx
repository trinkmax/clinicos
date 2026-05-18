"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { navForRole } from "@/config/nav";
import type { Role } from "@/lib/auth/roles";
import { UserMenu } from "@/components/shell/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar({
  role,
  email,
  fullName,
}: {
  role: Role | null;
  email: string | null;
  fullName: string | null;
}) {
  const pathname = usePathname();
  const groups = navForRole(role);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-3">
        <Link
          href="/"
          className="hover:bg-sidebar-accent flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors"
        >
          <Image
            src="/brand/logo-short.png"
            alt="Control Group"
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-md object-contain"
            priority
          />
          <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">
              clinicOS
            </span>
            <span className="text-muted-foreground text-[11px]">
              Control Group Salud
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.title}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <UserMenu email={email} role={role} fullName={fullName} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
