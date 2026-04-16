import { Link, useLocation } from "react-router-dom";
import { Terminal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const { pathname } = useLocation();

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container max-w-5xl flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2 font-mono font-bold text-sm tracking-tight hover:text-primary transition-colors">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="gradient-text">Terminal Migration</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavItem
            to="/iterm2-to-ghostty"
            icon={<Terminal className="w-3.5 h-3.5" />}
            label="iTerm2 → Ghostty"
            active={pathname === "/iterm2-to-ghostty"}
          />
          <NavItem
            to="/p10k-to-starship"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            label="P10k → Starship"
            active={pathname === "/p10k-to-starship"}
          />
        </div>
      </div>
    </nav>
  );
}

function NavItem({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
