import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { AuroraBg } from "@/components/brand/AuroraBg";
import { TOOLS, AGENTS, TOOL_ICONS } from "@/lib/ai-tools";
import {
  ArrowRight, Check, Sparkles, Zap, Shield,
  ChevronDown, Rocket, Brain, Workflow, Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { listPublicPlans } from "@/lib/plans.functions";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return (
      <div className="relative grid min-h-screen place-items-center">
        <AuroraBg />
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBg />
      <Nav />
      <Hero />
      <Features />
      <AgentsSection />
      <ShowcaseSection />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl glass-strong px-4 py-2.5 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#agents" className="hover:text-foreground transition">Agents</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth" search={{ mode: "signup" } as never}>
            <Button size="sm" className="gradient-bg text-white hover:opacity-90">
              Start free <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-24 pb-20 text-center sm:pt-32">
      <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
        Powered by a multi-agent AI system
      </div>
      <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-7xl">
        Build Your Entire <br className="hidden sm:block" />
        Business With <span className="gradient-text">AI</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
        Names, branding, marketing, launch strategies, websites and startup ideas generated instantly with AI.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link to="/auth" search={{ mode: "signup" } as never}>
          <Button size="lg" className="gradient-bg glow text-white hover:opacity-90">
            Start Building <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
        <Link to="/auth" search={{ mode: "signup" } as never}>
          <Button size="lg" variant="outline" className="glass border-white/10">
            Generate My Business
          </Button>
        </Link>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">No credit card · 5 free generations · 2-minute setup</p>

      <div className="relative mx-auto mt-16 max-w-5xl">
        <div className="absolute -inset-x-10 -inset-y-6 rounded-[2rem] bg-gradient-to-r from-fuchsia-600/20 via-violet-600/20 to-cyan-500/20 blur-2xl" />
        <div className="relative rounded-[1.75rem] glass-strong p-3 shadow-2xl">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-background/80">
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  const tools = TOOLS.slice(0, 6);
  return (
    <div className="grid grid-cols-12 gap-0">
      <aside className="col-span-3 hidden border-r border-white/5 p-4 md:block">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Brain className="h-3.5 w-3.5" /> AI Workspace</div>
        <div className="mt-4 space-y-1.5 text-sm">
          {["Dashboard", "AI Tools", "Saved Projects", "Analytics", "Settings"].map((l, i) => (
            <div key={l} className={`rounded-lg px-2.5 py-1.5 ${i === 1 ? "bg-white/5 text-foreground" : "text-muted-foreground"}`}>{l}</div>
          ))}
        </div>
      </aside>
      <div className="col-span-12 p-5 md:col-span-9">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Workspace</div>
            <div className="text-lg font-medium">AI Tools</div>
          </div>
          <div className="hidden gap-2 sm:flex">
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-muted-foreground">⌘ K</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.id} className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.05]">
                <div className={`mb-2 inline-grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${t.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{t.tagline}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Features() {
  const items = TOOLS.slice(0, 9);
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-xs uppercase tracking-widest text-fuchsia-300">A complete AI launch suite</div>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Every tool a founder needs, in one product</h2>
        <p className="mt-4 text-muted-foreground">From the first idea to launch day — generate branding, marketing, websites, finances and strategy in minutes.</p>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.id} className="group relative overflow-hidden rounded-2xl glass p-6 transition hover:-translate-y-0.5 hover:bg-white/[0.04]">
              <div className={`inline-grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${t.color} text-white shadow-lg`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AgentsSection() {
  return (
    <section id="agents" className="mx-auto max-w-6xl px-4 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-cyan-300">Multi-agent AI system</div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">A team of AI agents <br /> working in parallel</h2>
          <p className="mt-5 text-muted-foreground">
            Five specialised agents coordinate to design, write, plan and price your business — like a startup studio
            inside your browser.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { i: Workflow, t: "Coordinated workflows", d: "Agents pass context to each other end-to-end." },
              { i: Zap, t: "Real-time generation", d: "Outputs stream in as the agents think." },
              { i: Shield, t: "Saved & private", d: "Every generation is stored in your private workspace." },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="flex items-start gap-3">
                <I className="mt-0.5 h-5 w-5 text-fuchsia-400" />
                <div>
                  <div className="font-medium">{t}</div>
                  <div className="text-sm text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-fuchsia-600/20 to-cyan-500/20 blur-2xl" />
          <div className="relative aspect-square rounded-[2rem] glass-strong p-8">
            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-2xl gradient-bg glow grid place-items-center text-white">
              <Brain className="h-10 w-10" />
            </div>
            <div className="absolute inset-0 animate-orbit">
              {AGENTS.map((a, i) => {
                const Icon = (TOOL_ICONS as Record<string, typeof Sparkles>)[a.icon] ?? Sparkles;
                const angle = (i / AGENTS.length) * Math.PI * 2;
                const r = 38;
                const x = 50 + Math.cos(angle) * r;
                const y = 50 + Math.sin(angle) * r;
                return (
                  <div
                    key={a.name}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl glass-strong p-3 shadow-xl`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className={`mb-1 inline-grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${a.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-xs font-medium">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">{a.task}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <div className="rounded-3xl glass-strong p-8 sm:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-emerald-300">Example output</div>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight">"AI coffee shop in Karachi, $5k budget"</h3>
            <p className="mt-3 text-muted-foreground">In 20 seconds LaunchForge generated names, palette, menu, slogan and a launch plan.</p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Brand: Brewlytics — smart specialty coffee", "Palette: ink, espresso, neon-mint accent", "5 signature drinks + combo menu", "30-day Instagram launch calendar", "$4,820 startup cost breakdown"].map((s) => (
                <li key={s} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> {s}</li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["#0E0E12","#3D241B","#7BE0B5","#F5F0E6"].map((c) => (
              <div key={c} className="aspect-video rounded-xl border border-white/10" style={{ background: c }} />
            ))}
            <div className="col-span-2 rounded-xl glass p-4 text-sm">
              <div className="font-medium">Brewlytics</div>
              <div className="text-muted-foreground">"Coffee, smarter."</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [plans, setPlans] = useState<Array<{ id: string; name: string; price_inr: number; interval: string; description: string; features: string[]; highlighted: boolean }>>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listPublicPlans()
      .then((r) => setPlans((r.plans as never) ?? []))
      .catch(() => setPlans([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight">One simple plan</h2>
        <p className="mt-3 text-muted-foreground">Full access to every AI tool for the whole month. No tiers, no add-ons.</p>
      </div>
      <div className="mt-12 flex justify-center">
        {!loaded ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : plans.length === 0 ? (
          <div className="rounded-2xl glass p-7 text-center text-muted-foreground">No plans available yet.</div>
        ) : (
          <div className="grid w-full max-w-md gap-5">
            {plans.map((t) => (
              <div key={t.id} className={`relative rounded-2xl ${t.highlighted ? "glass-strong glow" : "glass"} p-8`}>
                {t.highlighted && <div className="absolute -top-3 left-8 rounded-full gradient-bg px-3 py-0.5 text-xs font-medium text-white">Full access</div>}
                <div className="text-sm text-muted-foreground">{t.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold">₹{t.price_inr.toLocaleString("en-IN")}</span>
                  <span className="text-sm text-muted-foreground">/{t.interval}</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{t.description}</div>
                <ul className="mt-6 space-y-2 text-sm">
                  {(t.features ?? []).map((f) => <li key={f} className="flex items-center gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {f}</li>)}
                </ul>
                <Link to="/auth" search={{ mode: "signup" } as never} className="mt-7 block">
                  <Button className="w-full gradient-bg text-white">Get started</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "What is LaunchForge AI?", a: "An AI Business Builder that turns ideas into complete startup brands, marketing systems, and launch plans." },
    { q: "Do I need to know how to build a startup?", a: "No. The platform walks you from idea to launch with AI agents handling branding, marketing, finance and strategy." },
    { q: "Can I save and edit generations?", a: "Yes. Every output is saved to your private workspace and you can edit or re-generate any of it." },
    { q: "Which AI models do you use?", a: "A mix of frontier reasoning and creative models, automatically selected for each task." },
    { q: "Is there a free plan?", a: "Yes — 5 free generations with no credit card required." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24">
      <div className="text-center">
        <h2 className="text-4xl font-semibold tracking-tight">Questions, answered</h2>
      </div>
      <div className="mt-10 space-y-3">
        {items.map((it, i) => (
          <div key={it.q} className="rounded-xl glass">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left">
              <span className="font-medium">{it.q}</span>
              <ChevronDown className={`h-4 w-4 transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <div className="px-5 pb-5 text-sm text-muted-foreground">{it.a}</div>}
          </div>
        ))}
      </div>
      <div className="mt-16 rounded-3xl glass-strong p-10 text-center">
        <Rocket className="mx-auto h-8 w-8 text-fuchsia-400" />
        <h3 className="mt-4 text-3xl font-semibold tracking-tight">Ready to launch?</h3>
        <p className="mt-2 text-muted-foreground">Spin up your entire business in the next 10 minutes.</p>
        <Link to="/auth" search={{ mode: "signup" } as never} className="mt-6 inline-block">
          <Button size="lg" className="gradient-bg text-white glow">Build my business <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-12">
      <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-muted-foreground sm:flex-row">
        <Logo size="sm" />
        <div>© {new Date().getFullYear()} LaunchForge AI. All rights reserved.</div>
        <div className="flex gap-5">
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
          <a href="/help" className="hover:text-foreground">Help</a>
        </div>
      </div>
    </footer>
  );
}
