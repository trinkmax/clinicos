"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { ALL_NAV_ITEMS } from "@/config/nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

function currentTitle(pathname: string) {
  if (pathname === "/") return "Inicio";
  const match = ALL_NAV_ITEMS.filter((i) => i.href !== "/").find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );
  return match?.title ?? "clinicOS";
}

function openCommandMenu() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
  );
}

export function AppTopbar() {
  const pathname = usePathname();

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4 backdrop-blur-md">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 !h-5" />
      <h1 className="text-[15px] font-semibold tracking-tight">
        {currentTitle(pathname)}
      </h1>

      <button
        type="button"
        onClick={openCommandMenu}
        className="text-muted-foreground bg-muted/60 hover:bg-muted ml-auto flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors"
        aria-label="Buscar (⌘K)"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Buscar…</span>
        <kbd className="bg-background ml-1 hidden rounded border px-1.5 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>
    </header>
  );
}
