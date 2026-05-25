import type { LucideIcon } from "lucide-react";
import {
  Lightbulb, Sparkles, Type, Palette, Image, FileText, Megaphone,
  Share2, UtensilsCrossed, Search, DollarSign, Rocket, Bot, MessageSquare,
  Globe, TrendingUp,
} from "lucide-react";

export type ToolField =
  | { name: string; label: string; type: "text" | "textarea"; placeholder?: string; required?: boolean }
  | { name: string; label: string; type: "select"; options: string[]; required?: boolean };

export type AiTool = {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  color: string; // tailwind from-/to- gradient
  category: "Ideas" | "Branding" | "Content" | "Marketing" | "Strategy" | "Research";
  system: string;
  fields: ToolField[];
  cta?: string;
};

export const TOOLS: AiTool[] = [
  {
    id: "idea",
    name: "Business Idea Generator",
    tagline: "Turn interests + budget into startup-ready ideas",
    icon: Lightbulb,
    color: "from-fuchsia-500 to-purple-600",
    category: "Ideas",
    cta: "Generate Ideas",
    system:
      "You are a startup advisor. Generate 5 concrete business ideas tailored to the user's inputs. For each idea include: name, 1-line pitch, difficulty (Easy/Medium/Hard), earning potential ($/mo range), scalability (Low/Medium/High), and a 5-step startup roadmap. Use clean markdown with H3 headings.",
    fields: [
      { name: "interests", label: "Your interests / skills", type: "text", placeholder: "e.g. fitness, AI, coffee", required: true },
      { name: "budget", label: "Starting budget (USD)", type: "select", options: ["< $500", "$500 - $5k", "$5k - $25k", "$25k+"], required: true },
      { name: "businessType", label: "Business type", type: "select", options: ["Online / SaaS", "Local / Physical", "E-commerce", "Agency / Service", "Content / Creator", "Anything"], required: true },
      { name: "audience", label: "Target audience", type: "text", placeholder: "Gen Z, busy moms, B2B SaaS founders…" },
      { name: "location", label: "Country / City", type: "text", placeholder: "Karachi, NYC, Global" },
      { name: "vibe", label: "Vibe / style", type: "text", placeholder: "futuristic, luxury, playful" },
    ],
  },
  {
    id: "name",
    name: "Brand Name Generator",
    tagline: "Premium, domain-friendly, modern startup names",
    icon: Sparkles,
    color: "from-violet-500 to-indigo-600",
    category: "Branding",
    cta: "Generate Names",
    system:
      "Generate 20 unique brand names. Mix one-word, two-word, and invented names. For each, append a likely .com availability (Likely / Maybe / Taken) and a 4-word reasoning. Present as a markdown table.",
    fields: [
      { name: "description", label: "What does the business do?", type: "textarea", placeholder: "AI tool that builds entire businesses", required: true },
      { name: "style", label: "Naming style", type: "select", options: ["Modern", "Luxury", "Futuristic", "Playful", "Minimal", "Bold"] },
      { name: "keywords", label: "Must-include keywords (optional)", type: "text", placeholder: "forge, launch, ai" },
    ],
  },
  {
    id: "slogan",
    name: "Slogan & Tagline",
    tagline: "Catchy taglines that convert",
    icon: Type,
    color: "from-pink-500 to-rose-600",
    category: "Branding",
    cta: "Generate Slogans",
    system: "Generate 15 short, punchy slogans (max 7 words). Use varied tones: bold, inspiring, witty, premium, technical. Output as a numbered list.",
    fields: [
      { name: "brand", label: "Brand name", type: "text", required: true },
      { name: "description", label: "What it does", type: "textarea", required: true },
      { name: "tone", label: "Tone", type: "select", options: ["Inspiring", "Bold", "Playful", "Luxury", "Technical"] },
    ],
  },
  {
    id: "brand",
    name: "Brand Identity",
    tagline: "Color palettes, typography, visual direction",
    icon: Palette,
    color: "from-amber-500 to-orange-600",
    category: "Branding",
    cta: "Generate Identity",
    system:
      "Create a full brand identity: 1) Brand personality (3 adjectives + paragraph). 2) Color palette of 5 hex colors with role + name. 3) Typography pair (heading + body) with Google Fonts. 4) Visual aesthetic direction (1 paragraph). 5) Logo concept ideas (3 bullets). Use clean markdown with sections.",
    fields: [
      { name: "brand", label: "Brand name", type: "text", required: true },
      { name: "industry", label: "Industry", type: "text", required: true },
      { name: "audience", label: "Target audience", type: "text" },
      { name: "vibe", label: "Desired vibe", type: "select", options: ["Modern", "Luxury", "Futuristic", "Earthy", "Minimal", "Playful"] },
    ],
  },
  {
    id: "logo",
    name: "Logo Concepts",
    tagline: "AI-generated logo concept ideas",
    icon: Image,
    color: "from-cyan-500 to-blue-600",
    category: "Branding",
    cta: "Generate Concepts",
    system:
      "Describe 6 distinct logo concept directions. Each: name the concept, the shape/mark, color usage, typographic feel, and what brand emotion it conveys. Number them and use H4 headings.",
    fields: [
      { name: "brand", label: "Brand name", type: "text", required: true },
      { name: "industry", label: "Industry", type: "text", required: true },
      { name: "style", label: "Logo style", type: "select", options: ["Wordmark", "Lettermark", "Iconic", "Abstract", "Mascot", "Futuristic"] },
    ],
  },
  {
    id: "website",
    name: "Website Copy",
    tagline: "Hero, about, features, CTAs, FAQ",
    icon: FileText,
    color: "from-emerald-500 to-teal-600",
    category: "Content",
    cta: "Generate Copy",
    system:
      "Write complete landing page copy. Sections: Hero (headline + subheadline + 2 CTAs), About (paragraph), 6 Features (title + 1-line desc), 3 product/service descriptions, Pricing tiers (3), FAQ (5), and closing CTA. Use markdown headings.",
    fields: [
      { name: "brand", label: "Brand name", type: "text", required: true },
      { name: "description", label: "What it does", type: "textarea", required: true },
      { name: "audience", label: "Target audience", type: "text" },
      { name: "tone", label: "Tone", type: "select", options: ["Bold", "Friendly", "Premium", "Technical", "Playful"] },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Engine",
    tagline: "Captions, ads, hashtags, launch campaigns",
    icon: Megaphone,
    color: "from-red-500 to-pink-600",
    category: "Marketing",
    cta: "Generate Marketing",
    system:
      "Produce a marketing kit: 5 Instagram captions, 5 reel hook ideas, 3 ad copy variants (Facebook), 3 Twitter/X posts, 20 hashtags, 2 launch email subject lines + bodies, and a 7-day launch campaign schedule. Use markdown sections.",
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true },
      { name: "description", label: "What it does", type: "textarea", required: true },
      { name: "audience", label: "Target audience", type: "text" },
    ],
  },
  {
    id: "social",
    name: "Social Media Studio",
    tagline: "Post ideas, thumbnails, banners",
    icon: Share2,
    color: "from-sky-500 to-cyan-600",
    category: "Marketing",
    cta: "Generate Posts",
    system: "Generate 10 social post ideas (mix of carousel, reel, story, static). Each: title, hook, body copy (<60 words), suggested visual, 5 hashtags. Markdown.",
    fields: [
      { name: "brand", label: "Brand", type: "text", required: true },
      { name: "topic", label: "Topic / focus", type: "text", required: true },
      { name: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "LinkedIn", "X / Twitter", "All"] },
    ],
  },
  {
    id: "menu",
    name: "Menu / Product Catalog",
    tagline: "Menus, combos, pricing, descriptions",
    icon: UtensilsCrossed,
    color: "from-orange-500 to-red-600",
    category: "Content",
    cta: "Generate Menu",
    system: "Create a full menu/product catalog. Group by category, each item with name, evocative 1-line description, and price suggestion. Add 3 combo deals. Use markdown tables.",
    fields: [
      { name: "business", label: "Business name", type: "text", required: true },
      { name: "type", label: "Type", type: "text", placeholder: "café, restaurant, store…", required: true },
      { name: "cuisine", label: "Cuisine / niche", type: "text" },
      { name: "currency", label: "Currency", type: "select", options: ["USD", "EUR", "GBP", "PKR", "INR", "AED"] },
    ],
  },
  {
    id: "competitor",
    name: "Competitor Analyzer",
    tagline: "Analyze branding, UX, SEO, weaknesses",
    icon: Search,
    color: "from-indigo-500 to-violet-600",
    category: "Research",
    cta: "Analyze",
    system:
      "Analyze the competitor URL/description provided. Output sections: Branding, Strengths, Weaknesses, UI/UX, Marketing strategy, SEO style, and Opportunities to differentiate. Use markdown with bullet points.",
    fields: [
      { name: "url", label: "Competitor URL", type: "text", placeholder: "https://example.com", required: true },
      { name: "context", label: "Anything we should know?", type: "textarea" },
    ],
  },
  {
    id: "finance",
    name: "Financial Planner",
    tagline: "Startup costs, pricing, profit margins",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    category: "Strategy",
    cta: "Generate Plan",
    system:
      "Produce a startup financial plan. Sections: Startup cost breakdown (table), recommended pricing strategy, expected profit margins, break-even analysis, and 3 growth/monetization ideas. Use markdown tables where useful.",
    fields: [
      { name: "business", label: "Business description", type: "textarea", required: true },
      { name: "budget", label: "Starting budget", type: "text", required: true },
      { name: "country", label: "Country", type: "text" },
    ],
  },
  {
    id: "roadmap",
    name: "Launch Roadmap",
    tagline: "Step-by-step launch plan + checklists",
    icon: Rocket,
    color: "from-purple-500 to-fuchsia-600",
    category: "Strategy",
    cta: "Generate Roadmap",
    system:
      "Build a 90-day launch roadmap broken into Week 1, Weeks 2-4, Month 2, Month 3. Each block: goals, key tasks (checklist), milestones, and risks. Add a pre-launch checklist at the end. Markdown.",
    fields: [
      { name: "business", label: "Business description", type: "textarea", required: true },
      { name: "stage", label: "Current stage", type: "select", options: ["Idea", "Prototype", "MVP", "Pre-launch"] },
    ],
  },
  {
    id: "trends",
    name: "Trend Discovery",
    tagline: "Trending niches, industries, viral ideas",
    icon: TrendingUp,
    color: "from-rose-500 to-orange-600",
    category: "Research",
    cta: "Discover Trends",
    system:
      "List 10 trending startup niches / business ideas for 2025-2026. For each: niche name, why it's hot, target audience, monetization angle, difficulty.",
    fields: [
      { name: "industry", label: "Industry filter (optional)", type: "text", placeholder: "AI, food, fashion…" },
      { name: "region", label: "Region", type: "text", placeholder: "Global / US / Europe / MENA" },
    ],
  },
  {
    id: "domain",
    name: "Domain Checker",
    tagline: "Domain ideas + availability hints",
    icon: Globe,
    color: "from-teal-500 to-cyan-600",
    category: "Branding",
    cta: "Suggest Domains",
    system:
      "Suggest 15 domain names for the brand. For each: domain, TLD options (.com / .ai / .io / .co), likely availability (Likely / Maybe / Taken), and short note. Output as a markdown table.",
    fields: [
      { name: "brand", label: "Brand or keyword", type: "text", required: true },
      { name: "industry", label: "Industry", type: "text" },
    ],
  },
];

export const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

// Multi-agent display (for the visual section)
export const AGENTS = [
  { name: "Branding Agent", icon: "Palette", color: "from-amber-500 to-orange-600", task: "names · identity · logos" },
  { name: "Marketing Agent", icon: "Megaphone", color: "from-red-500 to-pink-600", task: "campaigns · ads · social" },
  { name: "Finance Agent", icon: "DollarSign", color: "from-emerald-500 to-teal-600", task: "pricing · costs · margins" },
  { name: "Design Agent", icon: "Sparkles", color: "from-violet-500 to-fuchsia-600", task: "websites · UI · visuals" },
  { name: "Research Agent", icon: "Search", color: "from-indigo-500 to-blue-600", task: "trends · competitors · niches" },
] as const;

export const TOOL_ICONS = { Lightbulb, Sparkles, Type, Palette, Image, FileText, Megaphone, Share2, UtensilsCrossed, Search, DollarSign, Rocket, Bot, MessageSquare, Globe, TrendingUp };