import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(context: unknown) {
  const ctx = context as { supabase: { rpc: (fn: string, args: unknown) => Promise<{ data: unknown }> }; userId: string };
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden: admin access required.");
}

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ name: z.string().min(1).max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const raw = "lf_live_" + randomBytes(24).toString("hex");
    const key_hash = createHash("sha256").update(raw).digest("hex");
    const key_prefix = raw.slice(0, 16);
    const { error } = await supabaseAdmin.from("api_keys").insert({
      name: data.name,
      key_hash,
      key_prefix,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    // Full key is returned exactly once — it is never stored in plaintext.
    return { key: raw };
  });

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .select("id, name, key_prefix, is_active, last_used_at, request_count, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { keys: data ?? [] };
  });

export const setApiKeyActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), active: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin.from("api_keys").update({ is_active: data.active }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin.from("api_keys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });