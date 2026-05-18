"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

/** Refresca el inbox ante cualquier mensaje/conversación nueva (Realtime). */
export function InboxRealtime() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel("inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [router]);
  return null;
}
