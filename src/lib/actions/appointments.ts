"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/auth/roles";
import { action, type ActionResult } from "@/lib/actions/result";
import {
  appointmentSchema,
  APPT_ESTADO,
} from "@/lib/validation/appointments";

const TURNERO_ROLES = [
  ROLES.owner,
  ROLES.admin,
  ROLES.recepcion,
  ROLES.profesional,
] as const;

export async function createAppointment(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: TURNERO_ROLES, schema: appointmentSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("appointments")
        .insert({
          tenant_id: ctx.tenantId,
          patient_id: data.patient_id ?? null,
          profesional_id: data.profesional_id ?? null,
          fecha: data.fecha,
          hora: data.hora,
          duracion_min: data.duracion_min,
          tipo: data.tipo,
          modalidad: data.modalidad,
          virtual_flexible: data.virtual_flexible,
          nombre_contacto: data.nombre_contacto ?? null,
          telefono_contacto: data.telefono_contacto ?? null,
          notas: data.notas ?? null,
          created_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/turnero");
      return { id: row.id };
    },
  );
}

export async function setAppointmentStatus(
  id: string,
  estado: string,
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: TURNERO_ROLES,
      schema: z.object({ id: z.string().uuid(), estado: z.enum(APPT_ESTADO) }),
      input: { id, estado },
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("appointments")
        .update({ estado: data.estado })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath("/turnero");
      return { id: data.id };
    },
  );
}

export async function toggleAbono(
  id: string,
  abono: boolean,
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: TURNERO_ROLES,
      schema: z.object({ id: z.string().uuid(), abono: z.boolean() }),
      input: { id, abono },
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("appointments")
        .update({ abono: data.abono })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath("/turnero");
      return { id: data.id };
    },
  );
}
