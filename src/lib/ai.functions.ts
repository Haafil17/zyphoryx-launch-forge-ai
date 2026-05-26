import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TOOLS_BY_ID } from "./ai-tools";

const GenerateInput = z.object({
  toolId: z.string().min(1).max(64),
  inputs: z.record(z.string(), z.string().max(2000)),
});

export const generateWithTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data, context }) => {
    const tool = TOOLS_BY_ID[data.toolId];
    if (!tool) throw new Error("Unknown tool");

    // block check
    const { data: prof } = await context.supabase
      .from("profiles").select("is_blocked").eq("id", context.userId).single();
    if (prof?.is_blocked) throw new Error("Your account is blocked. Contact an administrator.");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const userPrompt = Object.entries(data.inputs)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `**${k}**: ${v}`)
      .join("\n");

    const gateway = createLovableAiGatewayProvider(key);
    const result = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: tool.system + "\n\nAlways return clean, well-structured markdown. Be specific and creative.",
      prompt: userPrompt || "Generate creative output for this tool.",
    });

    return { text: result.text, tool: tool.id };
  });

const ChatInput = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string().max(4000) })).min(1).max(40),
});

export const chatWithBusinessAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: prof } = await context.supabase
      .from("profiles").select("is_blocked").eq("id", context.userId).single();
    if (prof?.is_blocked) throw new Error("Your account is blocked.");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const result = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system:
        "You are LaunchForge AI, a sharp startup advisor. Help the founder with marketing, pricing, customer acquisition, branding, growth, and operations. Be concrete, give numbers/examples, use short paragraphs and bullets when helpful. Markdown allowed.",
      messages: data.messages,
    });
    return { text: result.text };
  });

const LogoInput = z.object({
  brand: z.string().min(1).max(80),
  industry: z.string().max(200).optional().default(""),
  style: z.string().max(80).optional().default("Modern"),
  colors: z.string().max(200).optional().default(""),
  count: z.number().int().min(1).max(4).optional().default(4),
});

export const generateLogoImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => LogoInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: prof } = await context.supabase
      .from("profiles").select("is_blocked").eq("id", context.userId).single();
    if (prof?.is_blocked) throw new Error("Your account is blocked.");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const prompt = `Professional logo for "${data.brand}". Industry: ${data.industry || "general"}. Style: ${data.style}. ${data.colors ? `Color direction: ${data.colors}.` : ""} Clean vector-style logo, centered on a pure solid white background, high contrast, memorable mark, no text artifacts, no watermark. Modern startup branding quality.`;

    const runOne = async () => {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Image gen failed (${res.status}): ${t.slice(0, 200)}`);
      }
      const json = await res.json() as { choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }> };
      const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!url) throw new Error("No image returned");
      return url;
    };

    const images = await Promise.all(Array.from({ length: data.count }, () => runOne()));
    return { images };
  });