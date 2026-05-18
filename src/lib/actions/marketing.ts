"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/auth/roles";
import { action, type ActionResult } from "@/lib/actions/result";
import {
  segmentSchema,
  campaignSchema,
  automationSchema,
  toggleAutomationSchema,
} from "@/lib/validation/marketing";
import type { Json } from "@/lib/db/database.types";

const MKT = [ROLES.owner, ROLES.admin, ROLES.marketing] as const;
const asJson = (v: unknown) => v as unknown as Json;

export async function createSegment(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: MKT, schema: segmentSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("segments")
        .insert({
          tenant_id: ctx.tenantId,
          nombre: data.nombre,
          descripcion: data.descripcion ?? null,
          definicion: asJson(
            data.etapa ? { etapa: data.etapa } : { all: true },
          ),
          created_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/marketing");
      return { id: row.id };
    },
  );
}

export async function createCampaign(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: MKT, schema: campaignSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("campaigns")
        .insert({
          tenant_id: ctx.tenantId,
          nombre: data.nombre,
          segment_id: data.segment_id ?? null,
          template_id: data.template_id ?? null,
          estado: "borrador",
          created_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/marketing");
      return { id: row.id };
    },
  );
}

export async function createAutomation(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: MKT, schema: automationSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const { data: row, error } = await supabase
        .from("automations")
        .insert({
          tenant_id: ctx.tenantId,
          nombre: data.nombre,
          trigger: asJson({ preset: data.preset }),
          acciones: asJson([{ type: "whatsapp", via: "worker" }]),
          activo: false,
          created_by: ctx.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/automatizaciones");
      return { id: row.id };
    },
  );
}

export async function toggleAutomation(
  id: string,
  activo: boolean,
): Promise<ActionResult<{ id: string }>> {
  return action(
    { roles: MKT, schema: toggleAutomationSchema, input: { id, activo } },
    async (data, ctx) => {
      const supabase = await createClient();
      const { error } = await supabase
        .from("automations")
        .update({ activo: data.activo })
        .eq("id", data.id)
        .eq("tenant_id", ctx.tenantId);
      if (error) throw new Error(error.message);
      revalidatePath("/automatizaciones");
      return { id: data.id };
    },
  );
}

/** Ejecuta YA los controles/adherencia vencidos (RPC SECURITY INVOKER). */
export async function runFollowupAutomations(): Promise<
  ActionResult<{ enviados: number }>
> {
  return action(
    { roles: MKT, schema: z.object({}), input: {} },
    async () => {
      const supabase = await createClient();
      const rpc = supabase.rpc as unknown as (
        fn: string,
      ) => Promise<{ data: unknown; error: { message: string } | null }>;
      const { data, error } = await rpc("run_followup_automations");
      if (error) throw new Error(error.message);
      return { enviados: Number(data ?? 0) };
    },
  );
}

/** Crea/edita una automatización desde el builder visual (trigger + pasos). */
export async function upsertAutomation(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const { automationDefSchema } = await import("@/lib/validation/marketing");
  return action(
    { roles: MKT, schema: automationDefSchema, input },
    async (data, ctx) => {
      const supabase = await createClient();
      const payload = {
        tenant_id: ctx.tenantId,
        nombre: data.nombre,
        trigger: asJson(data.trigger),
        acciones: asJson(data.acciones),
      };
      if (data.id) {
        const { error } = await supabase
          .from("automations")
          .update(payload)
          .eq("id", data.id)
          .eq("tenant_id", ctx.tenantId);
        if (error) throw new Error(error.message);
        revalidatePath("/automatizaciones");
        return { id: data.id };
      }
      const { data: row, error } = await supabase
        .from("automations")
        .insert({ ...payload, activo: false, created_by: ctx.userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      revalidatePath("/automatizaciones");
      return { id: row.id };
    },
  );
}
