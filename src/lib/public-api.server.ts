// Public REST API for LaunchForge AI.
// Exposes every AI tool to external websites, gated by an admin-issued API key.
// Requests are intercepted in start.ts before they reach the router.
import { createHash } from "node:crypto";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { TOOLS, TOOLS_BY_ID } from "./ai-tools";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

async function verifyKey(request: Request): Promise<{ ok: true; id: string } | { ok: false; res: Response }> {
  const auth = request.headers.get("authorization") ?? "";
  const headerKey = request.headers.get("x-api-key") ?? "";
  const raw = (auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : headerKey).trim();
  if (!raw) return { ok: false, res: json({ error: "Missing API key. Send it as 'Authorization: Bearer <key>' or 'x-api-key' header." }, 401) };
  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, is_active")
    .eq("key_hash", hashKey(raw))
    .maybeSingle();
  if (error || !data) return { ok: false, res: json({ error: "Invalid API key." }, 401) };
  if (!data.is_active) return { ok: false, res: json({ error: "This API key has been revoked." }, 403) };
  void supabaseAdmin.rpc("increment_api_key_usage", { _key_id: data.id });
  return { ok: true, id: data.id };
}

function gatewayKey(): string {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY on the server.");
  return key;
}

async function runTool(toolId: string, inputs: Record<string, string>): Promise<string> {
  const tool = TOOLS_BY_ID[toolId];
  if (!tool) throw new Error(`Unknown tool '${toolId}'.`);
  const userPrompt = Object.entries(inputs || {})
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `**${k}**: ${v}`)
    .join("\n");
  const gateway = createLovableAiGatewayProvider(gatewayKey());
  const result = await generateText({
    model: gateway("google/gemini-3-flash-preview"),
    system: tool.system + "\n\nAlways return clean, well-structured markdown. Be specific and creative.",
    prompt: userPrompt || "Generate creative output for this tool.",
  });
  return result.text;
}

async function runChat(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>): Promise<string> {
  const gateway = createLovableAiGatewayProvider(gatewayKey());
  const result = await generateText({
    model: gateway("google/gemini-3-flash-preview"),
    system:
      "You are LaunchForge AI, a sharp startup advisor. Help with marketing, pricing, customer acquisition, branding, growth, and operations. Be concrete, give numbers/examples, use short paragraphs and bullets. Markdown allowed.",
    messages,
  });
  return result.text;
}

async function runLogo(input: { brand: string; industry?: string; style?: string; colors?: string; count?: number }): Promise<string[]> {
  const brand = (input.brand || "").trim();
  if (!brand) throw new Error("'brand' is required.");
  const count = Math.min(Math.max(input.count ?? 4, 1), 4);
  const prompt = `Professional logo for "${brand}". Industry: ${input.industry || "general"}. Style: ${input.style || "Modern"}. ${input.colors ? `Color direction: ${input.colors}.` : ""} Clean vector-style logo, centered on a pure solid white background, high contrast, memorable mark, no text artifacts, no watermark. Modern startup branding quality.`;
  const key = gatewayKey();
  const runOne = async (): Promise<string> => {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!res.ok) throw new Error(`Image gen failed (${res.status})`);
    const j = (await res.json()) as { choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }> };
    const url = j.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) throw new Error("No image returned");
    return url;
  };
  return Promise.all(Array.from({ length: count }, () => runOne()));
}

function toolsCatalog() {
  return TOOLS.map((t) => ({
    id: t.id,
    name: t.name,
    tagline: t.tagline,
    category: t.category,
    kind: t.kind ?? "text",
    fields: t.fields.map((f) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      required: !!f.required,
      options: "options" in f ? f.options : undefined,
    })),
  }));
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Handles requests under /api/public/*. Returns null if the path is not ours.
 */
export async function handlePublicApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "");
  if (!path.startsWith("/api/public")) return null;

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    // Docs / health — no key required.
    if (path === "/api/public" || path === "/api/public/v1") {
      return json({
        name: "LaunchForge AI Public API",
        version: "v1",
        auth: "Send your key as 'Authorization: Bearer <key>' or 'x-api-key' header.",
        endpoints: {
          "GET /api/public/v1/tools": "List every available AI tool and its input fields.",
          "POST /api/public/v1/generate": "Run any text tool. Body: { toolId, inputs }.",
          "POST /api/public/v1/chat": "Chat with the AI advisor. Body: { messages: [{ role, content }] }.",
          "POST /api/public/v1/logo": "Generate logo images. Body: { brand, industry?, style?, colors?, count? }.",
        },
      });
    }

    // Tools catalog (key required).
    if (path === "/api/public/v1/tools" && request.method === "GET") {
      const v = await verifyKey(request);
      if (!v.ok) return v.res;
      return json({ tools: toolsCatalog() });
    }

    if (path === "/api/public/v1/generate" && request.method === "POST") {
      const v = await verifyKey(request);
      if (!v.ok) return v.res;
      const body = await readBody(request);
      const toolId = String(body.toolId ?? "");
      const inputs = (body.inputs ?? {}) as Record<string, string>;
      if (!toolId) return json({ error: "'toolId' is required. Call /api/public/v1/tools to list options." }, 400);
      if (TOOLS_BY_ID[toolId]?.kind === "image")
        return json({ error: "This is an image tool. Use POST /api/public/v1/logo instead." }, 400);
      const text = await runTool(toolId, inputs);
      return json({ toolId, text });
    }

    if (path === "/api/public/v1/chat" && request.method === "POST") {
      const v = await verifyKey(request);
      if (!v.ok) return v.res;
      const body = await readBody(request);
      const messages = Array.isArray(body.messages) ? (body.messages as Array<{ role: "user" | "assistant" | "system"; content: string }>) : [];
      if (!messages.length) return json({ error: "'messages' array is required." }, 400);
      const text = await runChat(messages);
      return json({ text });
    }

    if (path === "/api/public/v1/logo" && request.method === "POST") {
      const v = await verifyKey(request);
      if (!v.ok) return v.res;
      const body = await readBody(request);
      const images = await runLogo(body as { brand: string; industry?: string; style?: string; colors?: string; count?: number });
      return json({ images });
    }

    return json({ error: "Not found. See GET /api/public/v1 for available endpoints." }, 404);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Server error" }, 500);
  }
}