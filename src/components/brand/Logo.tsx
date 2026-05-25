import { Link } from "@tanstack/react-router";

export function Logo({ size = "md", as = "link" }: { size?: "sm" | "md" | "lg"; as?: "link" | "static" }) {
  const sizes = {
    sm: { mark: "h-7 w-7", text: "text-base" },
    md: { mark: "h-9 w-9", text: "text-lg" },
    lg: { mark: "h-12 w-12", text: "text-2xl" },
  }[size];
  const inner = (
    <span className="flex items-center gap-2.5">
      <span className={`relative ${sizes.mark} grid place-items-center rounded-xl gradient-bg glow shadow-lg`}>
        <svg viewBox="0 0 24 24" fill="none" className="h-1/2 w-1/2 text-white">
          <path d="M12 2 L4 13 H11 L9 22 L20 9 H13 L15 2 Z" fill="currentColor" />
        </svg>
      </span>
      <span className={`font-semibold tracking-tight ${sizes.text}`}>
        Launch<span className="gradient-text">Forge</span>
      </span>
    </span>
  );
  if (as === "static") return inner;
  return <Link to="/" className="inline-flex items-center">{inner}</Link>;
}