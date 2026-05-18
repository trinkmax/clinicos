"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/auth/roles";
import { patientSchema } from "@/lib/validation/patients";
import { action, type ActionResult } from "@/lib/actions/result";

const WRITE_ROLES = [
  ROLES.owner,
  ROLES.admin,
  ROLES.recepcion,
  ROLES.profesional,
] as const;

export async function createPatient(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: WRITE_ROLES, schema: patientSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("patients")
        .insert({
          tenant_id: ctx.tenantId,
          apellido: data.apellido,
          nombres: data.nombres,
          dni: data.dni ?? null,
          fecha_nacimiento: data.fecha_nacimiento ?? null,
          sexo: data.sexo,
          estado_civil: data.estado_civil ?? null,
          telefono: data.telefono ?? null,
          email: data.email ?? null,
          ocupacion: data.ocupacion ?? null,
          domicilio: data.domicilio ?? {},
          notas: data.notas ?? null,
          created_by: ctx.userId,
        })
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505")
          throw new Error("Ya existe un paciente con ese DNI.");
        throw new Error(error.message);
      }
      revalidatePath("/pacientes");
      return { id: row.id };
    },
  );
}

export async function updatePatient(
  id: string,
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    {
      roles: WRITE_ROLES,
      schema: patientSchema.extend({ id: z.string().uuid() }).partial({
        apellido: true,
        nombres: true,
      }),
      input: { ...(input as object), id },
    },
    async (data, ctx) => {
      const supabase = await createClient();
      const patch = { ...data } as Partial<typeof data>;
      delete patch.id;
      const { error } = await supabase
        .from("patients")
        .update({
          ...patch,
          dni: patch.dni ?? null,
          fecha_nacimiento: patch.fecha_nacimiento ?? null,
        })
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath(`/pacientes/${id}`);
      revalidatePath("/pacientes");
      return { id };
    },
  );
}
