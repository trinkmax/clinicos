"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/auth/roles";
import { action, type ActionResult } from "@/lib/actions/result";
import {
  deliverySchema,
  inventoryItemSchema,
  stockMovementSchema,
  completeFollowUpSchema,
  scheduleFollowUpsSchema,
} from "@/lib/validation/operations";

const COM_ROLES = [ROLES.owner, ROLES.admin, ROLES.comercial] as const;

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function registerDelivery(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: COM_ROLES, schema: deliverySchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("deliveries")
        .insert({
          tenant_id: ctx.tenantId,
          plan_id: data.plan_id ?? null,
          patient_id: data.patient_id,
          cantidad: data.cantidad,
          fecha: data.fecha ?? new Date().toISOString().slice(0, 10),
          detalle: data.detalle ?? null,
          created_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);

      // Descuento de stock opcional
      if (data.descontar_stock_item_id) {
        const { data: item } = await supabase
          .from("inventory_items")
          .select("stock")
          .eq("id", data.descontar_stock_item_id)
          .single();
        if (item) {
          await supabase.from("stock_movements").insert({
            tenant_id: ctx.tenantId,
            item_id: data.descontar_stock_item_id,
            tipo: "salida",
            cantidad: data.cantidad,
            ref_delivery_id: row.id,
            motivo: "Entrega a paciente",
            created_by: ctx.userId,
          });
          await supabase
            .from("inventory_items")
            .update({ stock: Number(item.stock) - data.cantidad })
            .eq("id", data.descontar_stock_item_id);
        }
      }
      revalidatePath("/comercial");
      return { id: row.id };
    },
  );
}

export async function createInventoryItem(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: COM_ROLES, schema: inventoryItemSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("inventory_items")
        .insert({
          tenant_id: ctx.tenantId,
          nombre: data.nombre,
          unidad: data.unidad,
          stock: data.stock,
          minimo: data.minimo,
          product_id: data.product_id ?? null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/comercial");
      return { id: row.id };
    },
  );
}

export async function adjustStock(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: COM_ROLES, schema: stockMovementSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: item, error: e1 } = await supabase
        .from("inventory_items")
        .select("stock")
        .eq("id", data.item_id)
        .single();
      if (e1 || !item) throw new Error("Ítem de stock no encontrado.");

      const delta =
        data.tipo === "entrada"
          ? data.cantidad
          : data.tipo === "salida"
            ? -data.cantidad
            : data.cantidad; // 'ajuste' = set absoluto
      const nuevo =
        data.tipo === "ajuste"
          ? data.cantidad
          : Number(item.stock) + delta;

      const { data: mov, error } = await supabase
        .from("stock_movements")
        .insert({
          tenant_id: ctx.tenantId,
          item_id: data.item_id,
          tipo: data.tipo,
          cantidad: data.cantidad,
          motivo: data.motivo ?? null,
          created_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await supabase
        .from("inventory_items")
        .update({ stock: nuevo })
        .eq("id", data.item_id);
      revalidatePath("/comercial");
      return { id: mov.id };
    },
  );
}

export async function completeFollowUp(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: COM_ROLES, schema: completeFollowUpSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("follow_ups")
        .update({
          estado: data.estado,
          resultado: data.resultado ?? null,
          done_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath("/comercial");
      return { id: data.id };
    },
  );
}

/** Crea controles 15/30/60 para un plan (idempotente por tipo+plan). */
export async function scheduleFollowUps(
  input: unknown,
): Promise<ActionResult<{ creados: number }>> {
  return action(
    { roles: COM_ROLES, schema: scheduleFollowUpsSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: plan, error } = await supabase
        .from("treatment_plans")
        .select("id, patient_id, episode_id, inicio")
        .eq("id", data.plan_id)
        .single();
      if (error || !plan) throw new Error("Plan no encontrado.");

      const base = plan.inicio ?? new Date().toISOString().slice(0, 10);
      const { data: existing } = await supabase
        .from("follow_ups")
        .select("tipo")
        .eq("plan_id", plan.id);
      const yaHechos = new Set((existing ?? []).map((e) => e.tipo));

      const targets = [
        { tipo: "control_15" as const, dias: 15 },
        { tipo: "control_30" as const, dias: 30 },
        { tipo: "control_60" as const, dias: 60 },
      ].filter((t) => !yaHechos.has(t.tipo));

      if (targets.length === 0) return { creados: 0 };

      const { error: insErr } = await supabase.from("follow_ups").insert(
        targets.map((t) => ({
          tenant_id: ctx.tenantId,
          patient_id: plan.patient_id,
          episode_id: plan.episode_id,
          plan_id: plan.id,
          tipo: t.tipo,
          due_date: addDays(base, t.dias),
          estado: "pendiente" as const,
        })),
      );
      if (insErr) throw new Error(insErr.message);
      revalidatePath("/comercial");
      return { creados: targets.length };
    },
  );
}
