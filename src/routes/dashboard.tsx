import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/brand/Logo";
import { AuroraBg } from "@/components/brand/AuroraBg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateWithTool, chatWithBusinessAi, generateLogoImages } from "@/lib/ai.functions";
import { createApiKey, listApiKeys, setApiKeyActive, deleteApiKey } from "@/lib/api-keys.functions";
import { TOOLS, TOOLS_BY_ID, AGENTS, TOOL_ICONS, type AiTool } from "@/lib/ai-tools";
import { toast } from "sonner";
import {
  LayoutDashboard, Wand2, FolderOpen, BarChart3, Settings, HelpCircle,
  MessageSquare, Shield, LogOut, Loader2, Save, Trash2, Sparkles, Send,
  TrendingUp, Users, Zap, ArrowRight, Search, KeyRound, Copy, Code2,
} from "lucide-react";

import { listAllPlans, createPlan, updatePlan, deletePlan } from "@/lib/plans.functions";

type View = "home" | "tools" | "tool" | "chat" | "projects" | "analytics" | "settings" | "admin";

export const Route = createFileRoute("/dashboard")({ component: Dash });

function Dash() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [view, setView] = useState<View>("home");
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading your workspace…</div>;
  }

  const go = (v: View, toolId?: string) => { setView(v); if (toolId) setActiveToolId(toolId); };

  const items: { v: View; label: string; icon: typeof LayoutDashboard }[] = [
    { v: "home", label: "Dashboard", icon: LayoutDashboard },
    { v: "tools", label: "AI Tools", icon: Wand2 },
    { v: "chat", label: "AI Advisor", icon: MessageSquare },
    { v: "projects", label: "Saved Projects", icon: FolderOpen },
    { v: "analytics", label: "Analytics", icon: BarChart3 },
    { v: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="relative min-h-screen">
      <AuroraBg />
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/5 px-4 py-5 md:flex md:flex-col">
          <Logo />
          <nav className="mt-7 space-y-1">
            {items.map(({ v, label, icon: Icon }) => {
              const active = view === v || (v === "tools" && view === "tool");
              return (
                <button key={v} onClick={() => go(v)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-white/[0.06] text-foreground" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              );
            })}
            <Link to="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-foreground">
              <HelpCircle className="h-4 w-4" /> Help Center
            </Link>
            {isAdmin && (
              <button onClick={() => go("admin")}
                className={`mt-2 flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${view === "admin" ? "border-white/15 bg-gradient-to-r from-fuchsia-600/25 to-cyan-500/25 text-foreground" : "border-white/5 text-fuchsia-300 hover:bg-white/[0.04]"}`}>
                <Shield className="h-4 w-4" /> Admin Panel
              </button>
            )}
          </nav>
          <div className="mt-auto">
            <div className="rounded-xl glass p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="gradient-bg text-xs text-white">
                    {(profile?.display_name ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{profile?.display_name ?? "User"}</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </div>
                <button onClick={() => signOut()} className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-h-screen flex-1">
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-background/60 px-4 py-3 backdrop-blur md:hidden">
            <Logo size="sm" />
            <Button variant="ghost" size="sm" onClick={() => signOut()}><LogOut className="h-4 w-4" /></Button>
          </div>
          <div className="px-4 py-6 sm:px-8 sm:py-8">
            {view === "home" && <HomeView go={go} />}
            {view === "tools" && <ToolsGrid onSelect={(id) => go("tool", id)} />}
            {view === "tool" && activeToolId && <ToolWorkspace tool={TOOLS_BY_ID[activeToolId]} onBack={() => go("tools")} />}
            {view === "chat" && <ChatView />}
            {view === "projects" && <ProjectsView onOpen={(id) => go("tool", id)} />}
            {view === "analytics" && <AnalyticsView />}
            {view === "settings" && <SettingsView />}
            {view === "admin" && isAdmin && <AdminView />}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );

  // keep loc reference quiet
  void loc;
}

// ---------- HOME ----------
function HomeView({ go }: { go: (v: View, toolId?: string) => void }) {
  const { profile } = useAuth();
  const [counts, setCounts] = useState({ total: 0, week: 0 });
  useEffect(() => {
    void supabase.from("saved_projects").select("id, created_at").then(({ data }) => {
      if (!data) return;
      const weekAgo = Date.now() - 7 * 86400000;
      setCounts({ total: data.length, week: data.filter((d) => new Date(d.created_at).getTime() > weekAgo).length });
    });
  }, []);
  const stats = [
    { label: "Projects generated", value: counts.total, icon: Sparkles, tint: "text-fuchsia-400" },
    { label: "This week", value: counts.week, icon: TrendingUp, tint: "text-emerald-400" },
    { label: "AI agents active", value: AGENTS.length, icon: Zap, tint: "text-cyan-400" },
    { label: "Tools available", value: TOOLS.length, icon: Wand2, tint: "text-amber-400" },
  ];
  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hi {profile?.display_name?.split(" ")[0] ?? "founder"} 👋</h1>
        <p className="mt-1 text-muted-foreground">Pick a tool below or describe your business and let the AI agents work.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="rounded-2xl glass p-5">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{label}</div>
              <Icon className={`h-4 w-4 ${tint}`} />
            </div>
            <div className="mt-2 text-3xl font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-3xl glass-strong p-6 sm:p-8">
        <div className="text-xs uppercase tracking-widest text-fuchsia-300">Start fast</div>
        <h2 className="mt-2 text-2xl font-semibold">Generate a complete business in 60 seconds</h2>
        <p className="mt-1 text-sm text-muted-foreground">Begin with the idea generator — outputs flow into branding, marketing and roadmap.</p>
        <Button onClick={() => go("tool", "idea")} className="mt-5 gradient-bg text-white">
          Generate my business <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-medium">Popular tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.slice(0, 6).map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => go("tool", t.id)}
                className="group text-left rounded-2xl glass p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.05]">
                <div className={`inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${t.color} text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3 font-medium">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.tagline}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- TOOLS GRID ----------
function ToolsGrid({ onSelect }: { onSelect: (id: string) => void }) {
  const [q, setQ] = useState("");
  const filtered = TOOLS.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) || t.tagline.toLowerCase().includes(q.toLowerCase()));
  const cats = Array.from(new Set(TOOLS.map((t) => t.category)));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI Tools</h1>
        <p className="mt-1 text-muted-foreground">{TOOLS.length} tools to design, write, market and launch your business.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools…" className="pl-9 glass border-white/10" />
      </div>
      {cats.map((cat) => {
        const items = filtered.filter((t) => t.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat}>
            <h2 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">{cat}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => onSelect(t.id)} className="group text-left rounded-2xl glass p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.05]">
                    <div className={`inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${t.color} text-white shadow-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-3 font-medium">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.tagline}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- TOOL WORKSPACE ----------
function ToolWorkspace({ tool, onBack }: { tool: AiTool; onBack: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const gen = useServerFn(generateWithTool);
  const genLogo = useServerFn(generateLogoImages);
  const Icon = tool.icon;

  const run = async () => {
    setLoading(true); setOutput(""); setImages([]);
    try {
      if (tool.kind === "image") {
        const res = await genLogo({
          data: {
            brand: values.brand ?? "",
            industry: values.industry ?? "",
            style: values.style ?? "Modern",
            colors: values.colors ?? "",
            count: 4,
          },
        });
        setImages(res.images);
      } else {
        const res = await gen({ data: { toolId: tool.id, inputs: values } });
        setOutput(res.text);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally { setLoading(false); }
  };

  const save = async () => {
    if (!output && images.length === 0) return;
    const { error } = await supabase.from("saved_projects").insert({
      title: (values[tool.fields[0]?.name as string] ?? tool.name).slice(0, 80),
      tool: tool.id,
      input: values,
      output: output || `[${images.length} logo image(s)]`,
      user_id: (await supabase.auth.getUser()).data.user!.id,
    });
    if (error) return toast.error(error.message);
    toast.success("Saved to your projects");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[400px,1fr]">
      <div className="space-y-5">
        <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground">← All tools</button>
        <div className="flex items-start gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-lg`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{tool.name}</h1>
            <p className="text-sm text-muted-foreground">{tool.tagline}</p>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl glass p-5">
          {tool.fields.map((f) => (
            <div key={f.name}>
              <Label>{f.label}{f.required && <span className="text-fuchsia-400"> *</span>}</Label>
              {f.type === "textarea" ? (
                <Textarea className="mt-1.5" rows={3} placeholder={(f as { placeholder?: string }).placeholder}
                  value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              ) : f.type === "select" ? (
                <Select value={values[f.name] ?? ""} onValueChange={(v) => setValues({ ...values, [f.name]: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose…" /></SelectTrigger>
                  <SelectContent>{f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input className="mt-1.5" placeholder={(f as { placeholder?: string }).placeholder}
                  value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              )}
            </div>
          ))}
          <Button onClick={run} disabled={loading} className="w-full gradient-bg text-white">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <>{tool.cta ?? "Generate"} <Sparkles className="ml-1.5 h-4 w-4" /></>}
          </Button>
        </div>
      </div>
      <div className="min-h-[400px] rounded-2xl glass-strong p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-1/3 rounded shimmer bg-white/5" />
            <div className="h-4 w-2/3 rounded shimmer bg-white/5" />
            <div className="h-4 w-1/2 rounded shimmer bg-white/5" />
            <div className="h-4 w-3/4 rounded shimmer bg-white/5" />
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Logos</div>
              <Button size="sm" onClick={save}><Save className="mr-1 h-3.5 w-3.5" /> Save</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {images.map((src, i) => (
                <a key={i} href={src} download={`${values.brand || "logo"}-${i + 1}.png`} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white">
                  <img src={src} alt={`Logo concept ${i + 1}`} className="aspect-square w-full object-contain" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-1.5 text-center text-xs text-white opacity-0 transition group-hover:opacity-100">Download</div>
                </a>
              ))}
            </div>
          </>
        ) : output ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">AI Output</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(output).then(() => toast.success("Copied"))}>Copy</Button>
                <Button size="sm" onClick={save}><Save className="mr-1 h-3.5 w-3.5" /> Save</Button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{output}</pre>
          </>
        ) : (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            <div>
              <Sparkles className="mx-auto h-8 w-8 text-fuchsia-400" />
              <div className="mt-3">Fill the form and hit generate.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- CHAT ----------
type Msg = { role: "user" | "assistant"; content: string };
function ChatView() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: "Hi! I'm your AI startup advisor. Ask me about marketing, pricing, growth — anything." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chat = useServerFn(chatWithBusinessAi);
  const send = async () => {
    if (!input.trim() || loading) return;
    const next = [...msgs, { role: "user" as const, content: input }];
    setMsgs(next); setInput(""); setLoading(true);
    try {
      const res = await chat({ data: { messages: next } });
      setMsgs([...next, { role: "assistant", content: res.text }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  };
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <h1 className="text-2xl font-semibold tracking-tight">AI Business Advisor</h1>
      <p className="text-sm text-muted-foreground">Ask anything about building, marketing or scaling.</p>
      <div className="mt-5 flex-1 space-y-4 overflow-y-auto rounded-2xl glass p-5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "gradient-bg text-white" : "bg-white/5"}`}>
              <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-muted-foreground">Thinking…</div>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-4 flex gap-2">
        <Input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="How should I price my SaaS?" className="glass border-white/10" />
        <Button type="submit" disabled={loading || !input.trim()} className="gradient-bg text-white"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}

// ---------- PROJECTS ----------
function ProjectsView({ onOpen }: { onOpen: (toolId: string) => void }) {
  const [rows, setRows] = useState<Array<{ id: string; title: string; tool: string; output: string; created_at: string }>>([]);
  const load = async () => {
    const { data } = await supabase.from("saved_projects").select("id, title, tool, output, created_at").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { void load(); }, []);
  const del = async (id: string) => {
    await supabase.from("saved_projects").delete().eq("id", id);
    void load();
    toast.success("Deleted");
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Saved Projects</h1>
      {rows.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">No saved generations yet. Generate something and hit Save.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const tool = TOOLS_BY_ID[r.tool];
            const Icon = tool?.icon ?? Sparkles;
            return (
              <div key={r.id} className="rounded-2xl glass p-5">
                <div className="flex items-start justify-between">
                  <div className={`inline-grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${tool?.color ?? "from-fuchsia-500 to-purple-600"} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <button onClick={() => del(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-3 font-medium line-clamp-1">{r.title}</div>
                <div className="text-xs text-muted-foreground">{tool?.name ?? r.tool}</div>
                <div className="mt-3 line-clamp-3 text-sm text-muted-foreground">{r.output.slice(0, 200)}</div>
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => onOpen(r.tool)}>Open tool</Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- ANALYTICS ----------
function AnalyticsView() {
  const [data, setData] = useState<Array<{ tool: string; count: number }>>([]);
  useEffect(() => {
    void supabase.from("saved_projects").select("tool").then(({ data }) => {
      const m = new Map<string, number>();
      (data ?? []).forEach((r) => m.set(r.tool, (m.get(r.tool) ?? 0) + 1));
      setData(Array.from(m.entries()).map(([tool, count]) => ({ tool, count })).sort((a, b) => b.count - a.count));
    });
  }, []);
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
      <div className="rounded-2xl glass p-6">
        <div className="text-sm font-medium">Generations by tool</div>
        {data.length === 0 ? (
          <div className="mt-6 text-sm text-muted-foreground">No data yet — generate something to see analytics.</div>
        ) : (
          <div className="mt-5 space-y-3">
            {data.map((d) => (
              <div key={d.tool}>
                <div className="flex justify-between text-xs"><span>{TOOLS_BY_ID[d.tool]?.name ?? d.tool}</span><span className="text-muted-foreground">{d.count}</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded bg-white/5"><div className="h-full gradient-bg" style={{ width: `${(d.count / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- SETTINGS ----------
function SettingsView() {
  const { profile, user, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [dark, setDark] = useState(true);
  useEffect(() => { setName(profile?.display_name ?? ""); }, [profile]);
  const save = async () => {
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    await refreshProfile();
    toast.success("Profile updated");
  };
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", dark);
    html.classList.toggle("light", !dark);
  }, [dark]);
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <div className="rounded-2xl glass p-6 space-y-4">
        <div className="text-sm font-medium">Profile</div>
        <div><Label>Email</Label><Input value={user?.email ?? ""} disabled className="mt-1.5" /></div>
        <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" /></div>
        <Button onClick={save} className="gradient-bg text-white">Save profile</Button>
      </div>
      <div className="rounded-2xl glass p-6">
        <div className="text-sm font-medium">Appearance</div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-sm">Dark mode</div>
            <div className="text-xs text-muted-foreground">Use the futuristic dark theme.</div>
          </div>
          <Switch checked={dark} onCheckedChange={setDark} />
        </div>
      </div>
    </div>
  );
}

// ---------- ADMIN ----------
type ProfileRow = { id: string; email: string | null; display_name: string | null; is_blocked: boolean; created_at: string };
function AdminView() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const load = async () => {
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,email,display_name,is_blocked,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role").eq("role", "admin"),
    ]);
    setUsers(profs ?? []);
    setAdmins(new Set((roles ?? []).map((r) => r.user_id)));
  };
  useEffect(() => { void load(); }, []);

  const toggleBlock = async (u: ProfileRow) => {
    const { error } = await supabase.from("profiles").update({ is_blocked: !u.is_blocked }).eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success(u.is_blocked ? "User unblocked" : "User blocked");
    void load();
  };
  const toggleAdmin = async (u: ProfileRow) => {
    if (admins.has(u.id)) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
      if (error) return toast.error(error.message);
    }
    void load();
  };

  const filtered = users.filter((u) =>
    !q || (u.email ?? "").toLowerCase().includes(q.toLowerCase()) || (u.display_name ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-fuchsia-400" />
        <h1 className="text-3xl font-semibold tracking-tight">Admin Panel</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total users" value={users.length} icon={Users} />
        <Stat label="Admins" value={admins.size} icon={Shield} />
        <Stat label="Blocked" value={users.filter((u) => u.is_blocked).length} icon={Trash2} />
      </div>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" className="pl-9 glass border-white/10" />
      </div>
      <div className="overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.display_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3">{admins.has(u.id) ? <Badge className="gradient-bg text-white">Admin</Badge> : <Badge variant="outline">User</Badge>}</td>
                <td className="px-4 py-3">{u.is_blocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="outline" className="text-emerald-400">Active</Badge>}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => toggleAdmin(u)}>{admins.has(u.id) ? "Revoke admin" : "Make admin"}</Button>
                  <Button size="sm" variant={u.is_blocked ? "outline" : "destructive"} onClick={() => toggleBlock(u)}>{u.is_blocked ? "Unblock" : "Block"}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PlansSection />
      <ApiKeysSection />
    </div>
  );
}
function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center justify-between"><div className="text-xs text-muted-foreground">{label}</div><Icon className="h-4 w-4 text-fuchsia-400" /></div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

export const __keepIcons = TOOL_ICONS;

// ---------- API KEYS (admin only) ----------
type ApiKeyRow = { id: string; name: string; key_prefix: string; is_active: boolean; last_used_at: string | null; request_count: number; created_at: string };
function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const create = useServerFn(createApiKey);
  const list = useServerFn(listApiKeys);
  const setActive = useServerFn(setApiKeyActive);
  const del = useServerFn(deleteApiKey);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const load = async () => {
    try { const res = await list(); setKeys(res.keys as ApiKeyRow[]); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load keys"); }
  };
  useEffect(() => { void load(); }, []);

  const onCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await create({ data: { name: name.trim() } });
      setNewKey(res.key);
      setName("");
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <KeyRound className="h-5 w-5 text-cyan-400" />
        <h2 className="text-xl font-semibold tracking-tight">Public API Keys</h2>
      </div>
      <p className="text-sm text-muted-foreground">Generate keys so other websites can use every LaunchForge AI feature over HTTP.</p>

      <div className="rounded-2xl glass p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label>Key name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My marketing site" className="mt-1.5 glass border-white/10" />
          </div>
          <Button onClick={onCreate} disabled={creating || !name.trim()} className="gradient-bg text-white">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><KeyRound className="mr-1.5 h-4 w-4" /> Generate key</>}
          </Button>
        </div>
        {newKey && (
          <div className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-4">
            <div className="text-xs text-cyan-300">Copy this key now — it won't be shown again.</div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-black/40 px-3 py-2 text-sm">{newKey}</code>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(newKey); toast.success("Copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        )}
      </div>

      {keys.length > 0 && (
        <div className="overflow-hidden rounded-2xl glass">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Key</th><th className="px-4 py-3">Requests</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3"><code className="text-xs text-muted-foreground">{k.key_prefix}…</code></td>
                  <td className="px-4 py-3">{k.request_count}</td>
                  <td className="px-4 py-3">{k.is_active ? <Badge variant="outline" className="text-emerald-400">Active</Badge> : <Badge variant="destructive">Revoked</Badge>}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={async () => { await setActive({ data: { id: k.id, active: !k.is_active } }); void load(); }}>{k.is_active ? "Revoke" : "Enable"}</Button>
                    <Button size="sm" variant="destructive" onClick={async () => { await del({ data: { id: k.id } }); void load(); toast.success("Deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl glass p-5">
        <div className="flex items-center gap-2"><Code2 className="h-4 w-4 text-fuchsia-400" /><div className="text-sm font-medium">How to use the API</div></div>
        <p className="mt-2 text-xs text-muted-foreground">Base URL: <code className="rounded bg-black/40 px-1.5 py-0.5">{baseUrl}/api/public/v1</code></p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-black/40 p-4 text-xs leading-relaxed">{`# List all tools
curl ${baseUrl}/api/public/v1/tools -H "Authorization: Bearer YOUR_KEY"

# Run any text tool
curl -X POST ${baseUrl}/api/public/v1/generate \\
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"toolId":"idea","inputs":{"Industry":"Coffee"}}'

# Chat with the AI advisor
curl -X POST ${baseUrl}/api/public/v1/chat \\
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":"How do I price my SaaS?"}]}'

# Generate logos
curl -X POST ${baseUrl}/api/public/v1/logo \\
  -H "Authorization: Bearer YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"brand":"NovaBrew","style":"Modern","count":4}'`}</pre>
      </div>
    </div>
  );
}