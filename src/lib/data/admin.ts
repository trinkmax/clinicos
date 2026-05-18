import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/db/database.types";

export type MembershipRow =
  Database["public"]["Tables"]["memberships"]["Row"];
export type AuditRow = Database["public"]["Tables"]["audit_log"]["Row"];

export interface MemberWithEmail extends MembershipRow {
  email: string | null;
}

/** Miembros del tenant + email resuelto vía admin client. */
export async function listMembers(): Promise<MemberWithEmail[]> {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("memberships")
    .select("*")
    .order("created_at", { ascending: true });
  if (!members || members.length === 0) return [];

  let emails = new Map<string, string>();
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    emails = new Map(
      data.users.map((u) => [u.id, u.email ?? ""] as const),
    );
  } catch {
    /* sin secret key: se muestran sin email */
  }
  return members.map((m) => ({ ...m, email: emails.get(m.user_id) ?? null }));
}

export async function recentAudit(limit = 50): Promise<AuditRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getTenant() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select("*")
    .limit(1)
    .maybeSingle();
  return data;
}
