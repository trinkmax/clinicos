"use server";

import { z } from "zod";

import { requireTenant } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ROLES, hasAnyRole } from "@/lib/auth/roles";

const querySchema = z.object({
  q: z.string().trim().min(2).max(80),
});

export interface SearchHit {
  type: "patient" | "conversation" | "plan";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

const CLIN = [
  ROLES.owner,
  ROLES.admin,
  ROLES.recepcion,
  ROLES.profesional,
  ROLES.asesor,
  ROLES.comercial,
] as const;
const CRM = [
  ROLES.owner,
  ROLES.admin,
  ROLES.marketing,
  ROLES.comercial,
  ROLES.recepcion,
] as const;
const COM = [ROLES.owner, ROLES.admin, ROLES.comercial] as const;

export async function searchEntities(q: string): Promise<SearchHit[]> {
  const parsed = querySchema.safeParse({ q });
  if (!parsed.success) return [];

  const ctx = await requireTenant();
  const supabase = await createClient();
  const like = `%${parsed.data.q}%`;

  const canPatients = hasAnyRole(ctx.role, CLIN);
  const canConversations = hasAnyRole(ctx.role, CRM);
  const canPlans = hasAnyRole(ctx.role, COM);

  const [patientsRes, conversationsRes, plansRes] = await Promise.all([
    canPatients
      ? supabase
          .from("patients")
          .select("id, apellido, nombres, dni, status")
          .or(
            `apellido.ilike.${like},nombres.ilike.${like},dni.ilike.${like},telefono.ilike.${like}`,
          )
          .limit(6)
      : Promise.resolve({ data: [] as Patient[], error: null }),
    canConversations
      ? supabase
          .from("contacts")
          .select(
            "id, nombre, telefono, etapa, conversations:conversations(id)",
          )
          .or(`nombre.ilike.${like},telefono.ilike.${like}`)
          .limit(6)
      : Promise.resolve({ data: [] as Contact[], error: null }),
    canPlans
      ? supabase
          .from("treatment_plans")
          .select(
            "id, descripcion, estado, patient:patients(id, apellido, nombres)",
          )
          .or(`descripcion.ilike.${like}`)
          .limit(4)
      : Promise.resolve({ data: [] as Plan[], error: null }),
  ]);

  const hits: SearchHit[] = [];

  for (const p of (patientsRes.data ?? []) as Patient[]) {
    hits.push({
      type: "patient",
      id: p.id,
      title: `${p.apellido}, ${p.nombres}`,
      subtitle:
        [p.dni && `DNI ${p.dni}`, p.status?.replace("_", " ")]
          .filter(Boolean)
          .join(" · ") || "Paciente",
      href: `/pacientes/${p.id}`,
    });
  }
  for (const c of (conversationsRes.data ?? []) as Contact[]) {
    const convId = c.conversations?.[0]?.id;
    hits.push({
      type: "conversation",
      id: c.id,
      title: c.nombre ?? c.telefono ?? "Contacto",
      subtitle:
        [c.telefono, c.etapa].filter(Boolean).join(" · ") || "Contacto",
      href: convId ? `/inbox?c=${convId}` : `/inbox?view=contactos`,
    });
  }
  for (const pl of (plansRes.data ?? []) as Plan[]) {
    hits.push({
      type: "plan",
      id: pl.id,
      title: pl.descripcion ?? "Plan de tratamiento",
      subtitle: pl.patient
        ? `${pl.patient.apellido}, ${pl.patient.nombres} · ${pl.estado}`
        : pl.estado,
      href: `/comercial`,
    });
  }

  return hits;
}

interface Patient {
  id: string;
  apellido: string;
  nombres: string;
  dni: string | null;
  status: string | null;
}
interface Contact {
  id: string;
  nombre: string | null;
  telefono: string | null;
  etapa: string;
  conversations?: { id: string }[];
}
interface Plan {
  id: string;
  descripcion: string | null;
  estado: string;
  patient: { id: string; apellido: string; nombres: string } | null;
}
