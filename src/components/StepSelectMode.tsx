import { Terminal, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MigrationMode = "iterm2" | "p10k" | "both";

interface StepSelectModeProps {
  onSelect: (mode: MigrationMode) => void;
}

export function StepSelectMode({ onSelect }: StepSelectModeProps) {
  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      <h2 className="text-2xl font-mono font-bold mb-2 text-center">选择迁移内容</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">
        你可以分别迁移，也可以一次性全部迁移
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <ModeCard
          icon={<Terminal className="w-6 h-6 text-ghost-green" />}
          title="iTerm2 → Ghostty"
          desc="将 iTerm2 的字体、颜色、快捷键等配置转换为 Ghostty 配置文件"
          tag="终端模拟器"
          onClick={() => onSelect("iterm2")}
        />
        <ModeCard
          icon={<Sparkles className="w-6 h-6 text-ghost-amber" />}
          title="Powerlevel10k → Starship"
          desc="将 P10k 的 Prompt 段、颜色、格式等转换为 Starship TOML 配置"
          tag="Shell 主题"
          onClick={() => onSelect("p10k")}
        />
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => onSelect("both")}
          size="lg"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-border font-mono"
        >
          全部迁移（推荐）
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  tag,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-5 text-left hover:border-primary/50 transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{tag}</span>
      </div>
      <h3 className="font-mono text-sm font-semibold mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity font-mono">
        开始迁移 <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}
