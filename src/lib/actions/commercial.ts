"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/auth/roles";
import { action, type ActionResult } from "@/lib/actions/result";
import {
  productSchema,
  treatmentPlanSchema,
  paymentSchema,
} from "@/lib/validation/commercial";

const COM_ROLES = [ROLES.owner, ROLES.admin, ROLES.comercial] as const;

export async function createProduct(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: COM_ROLES, schema: productSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("products")
        .insert({ ...data, tenant_id: ctx.tenantId })
        .select("id")
        .single();
      if (error) {
        if (error.code === "23505")
          throw new Error("Ya existe un producto con ese código.");
        throw new Error(error.message);
      }
      revalidatePath("/comercial");
      return { id: row.id };
    },
  );
}

export async function createPlan(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: COM_ROLES, schema: treatmentPlanSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("treatment_plans")
        .insert({
          tenant_id: ctx.tenantId,
          patient_id: data.patient_id,
          product_id: data.product_id ?? null,
          descripcion: data.descripcion ?? null,
          costo_total: data.costo_total,
          cant_aplicaciones: data.cant_aplicaciones,
          inicio: data.inicio ?? null,
          notas: data.notas ?? null,
          created_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/comercial");
      return { id: row.id };
    },
  );
}

export async function registerPayment(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: COM_ROLES, schema: paymentSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("payments")
        .insert({
          tenant_id: ctx.tenantId,
          plan_id: data.plan_id,
          patient_id: data.patient_id,
          importe: data.importe,
          fecha: data.fecha ?? new Date().toISOString().slice(0, 10),
          medio: data.medio ?? null,
          notas: data.notas ?? null,
          created_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/comercial");
      return { id: row.id };
    },
  );
}
