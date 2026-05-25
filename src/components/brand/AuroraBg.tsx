export function AuroraBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute -top-40 left-1/4 h-[40rem] w-[40rem] rounded-full bg-fuchsia-600/30 blur-[120px] animate-float-slow" />
      <div className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-cyan-500/25 blur-[120px] animate-float-slow" style={{ animationDelay: "-3s" }} />
      <div className="absolute bottom-0 left-0 h-[30rem] w-[30rem] rounded-full bg-violet-700/30 blur-[120px] animate-float-slow" style={{ animationDelay: "-6s" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background" />
    </div>
  );
}