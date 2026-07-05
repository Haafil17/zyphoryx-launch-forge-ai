import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(context: unknown) {
  const ctx = context as { supabase: { rpc: (fn: string, args: unknown) => Promise<{ data: unknown }> }; userId: string };
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden: admin access required.");
}

const PlanFields = z.object({
  name: z.string().min(1).max(80),
  price_inr: z.number().int().min(0).max(10000000),
  interval: z.string().min(1).max(20).default("month"),
  description: z.string().max(400).default(""),
  features: z.array(z.string().max(200)).max(30).default([]),
  is_active: z.boolean().default(true),
  highlighted: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(1000).default(0),
});

export const listPublicPlans = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("plans")
    .select("id, name, price_inr, interval, description, features, highlighted")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return { plans: data ?? [] };
});

export const listAllPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await supabaseAdmin
      .from("plans")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { plans: data ?? [] };
  });

export const createPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PlanFields.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin.from("plans").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PlanFields.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...fields } = data;
    const { error } = await supabaseAdmin.from("plans").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin.from("plans").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
