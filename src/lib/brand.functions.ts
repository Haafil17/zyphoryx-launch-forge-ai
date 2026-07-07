import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const BRAND_QUESTIONS = [
  { name: "business", label: "What does your business do?", type: "textarea", placeholder: "e.g. AI tool that turns an idea into a launch-ready brand", required: true },
  { name: "customers", label: "Who are your customers?", type: "text", placeholder: "e.g. first-time founders, Gen Z creators", required: true },
  { name: "mission", label: "What's your mission?", type: "textarea", placeholder: "Why does this exist?" },
  { name: "price", label: "Premium or affordable?", type: "select", options: ["Premium", "Mid-market", "Affordable"] },
  { name: "era", label: "Modern or traditional?", type: "select", options: ["Modern", "Balanced", "Traditional"] },
  { name: "tone", label: "Fun or professional?", type: "select", options: ["Fun & playful", "Balanced", "Serious & professional"] },
  { name: "competitors", label: "Which competitors do you admire?", type: "text", placeholder: "Brands you look up to" },
  { name: "keywords", label: "Words that should describe the brand", type: "text", placeholder: "bold, clear, trustworthy" },
  { name: "avoid", label: "Anything to avoid?", type: "text", placeholder: "names/styles you dislike (optional)" },
  { name: "currency", label: "Currency for any pricing", type: "select", options: ["INR", "USD", "EUR", "GBP", "AED"] },
] as const;

const BuildInput = z.object({
  answers: z.record(z.string(), z.string().max(2000)),
});

const SYSTEM = `You are an elite AI branding agency that takes a business idea to a launch-ready brand.
Produce a COMPLETE, cohesive brand package in clean, well-structured Markdown with these sections (use H2 "## " headings, in this exact order):

## 1. Brand Strategy
Brand positioning, target audience, Unique Value Proposition (UVP), brand personality (3 adjectives), tone of voice, and brand promise.

## 2. Brand Identity
Provide 5 brand name options. For EACH name give: the name (H3), its meaning/origin, why it fits, pronunciation, and a matching tagline/slogan. Explain each — never dump random names.

## 3. Visual Identity
A color palette of 5 colors (name + HEX + role), a typography pair (heading + body, real Google Fonts), logo concept directions (3), icon style, illustration style, photography style, and overall UI style. Keep everything consistent.

## 4. Website Copy
Launch-ready copy: Hero (headline + subheadline + 2 CTA buttons), About, Services/Features (6), FAQ (5), and a Contact/CTA section.

## 5. Social Media Kit
Instagram bio, LinkedIn bio, X (Twitter) bio, a launch announcement post, and 10 content post ideas.

## 6. Brand Guidelines
Logo usage rules, colors, typography, tone of voice, writing style, and Do's & Don'ts.

## 7. Brand Score
Give an overall score out of 100 and a scored breakdown table for: Memorability, Trust, Uniqueness, Professionalism, Consistency, Pronunciation, Scalability (each /100). Then 3 concrete tips to improve the weakest areas.

Be specific, confident, and creative. Use markdown tables where useful. Recommend one memorable primary brand name at the very end under "## Recommended Brand".`;

export const buildBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BuildInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: prof } = await context.supabase
      .from("profiles").select("is_blocked").eq("id", context.userId).single();
    if (prof?.is_blocked) throw new Error("Your account is blocked. Contact an administrator.");

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const userPrompt = Object.entries(data.answers)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `**${k}**: ${v}`)
      .join("\n");

    const gateway = createLovableAiGatewayProvider(key);
    const result = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM,
      prompt: userPrompt || "Build a complete brand for a new startup.",
    });

    return { text: result.text };
  });
