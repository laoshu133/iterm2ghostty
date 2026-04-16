import { Link } from "react-router-dom";
import { Terminal, Sparkles, ArrowRight, Zap, Puzzle, Rocket } from "lucide-react";

export default function Home() {
  return (
    <div className="animate-slide-up max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-14">
        <h1 className="text-4xl sm:text-5xl font-mono font-bold mb-4 tracking-tight">
          <span className="gradient-text">Terminal Migration</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          一键迁移你的终端配置到现代化工具栈
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-14">
        <ToolCard
          to="/iterm2-to-ghostty"
          icon={<Terminal className="w-7 h-7 text-ghost-green" />}
          title="iTerm2 → Ghostty"
          desc="将 iTerm2 的字体、颜色、快捷键等配置转换为 Ghostty 纯文本配置"
          tags={["终端模拟器", "GPU 加速", "纯文本配置"]}
          color="ghost-green"
        />
        <ToolCard
          to="/p10k-to-starship"
          icon={<Sparkles className="w-7 h-7 text-ghost-amber" />}
          title="Powerlevel10k → Starship"
          desc="将 P10k 的 Prompt 段、颜色、格式转换为 Starship TOML 配置"
          tags={["Shell 主题", "跨 Shell", "Rust 驱动"]}
          color="ghost-amber"
        />
      </div>

      {/* Why migrate */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        <InfoCard icon={<Zap className="w-5 h-5 text-ghost-amber" />} title="GPU 加速" desc="Ghostty 基于 Metal/Vulkan，渲染速度快数倍" />
        <InfoCard icon={<Terminal className="w-5 h-5 text-ghost-green" />} title="原生体验" desc="macOS SwiftUI / Linux GTK 原生 UI" />
        <InfoCard icon={<Puzzle className="w-5 h-5 text-ghost-purple" />} title="极速启动" desc="Starship ~5ms 启动，告别 Oh My Zsh 卡顿" />
        <InfoCard icon={<Rocket className="w-5 h-5 text-ghost-blue" />} title="纯文本配置" desc="所有配置都是可读的纯文本，易于版本控制" />
      </div>

      {/* Architecture */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-mono text-lg mb-4 text-primary">迁移方案总览</h2>
        <div className="space-y-4 text-sm">
          <FlowItem step="1" title="终端模拟器" from="iTerm2" to="Ghostty" note="自动转换配置：字体、颜色、快捷键" />
          <FlowItem step="2" title="Shell 主题" from="Powerlevel10k / Oh My Zsh" to="Starship" note="自动转换 prompt 段、颜色、格式" />
          <FlowItem step="3" title="插件管理" from="Oh My Zsh 内置" to="Sheldon / zinit" note="更快的插件加载，按需启用" />
        </div>
      </div>
    </div>
  );
}

function ToolCard({ to, icon, title, desc, tags, color }: {
  to: string; icon: React.ReactNode; title: string; desc: string; tags: string[]; color: string;
}) {
  return (
    <Link
      to={to}
      className="group bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-all block"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-mono text-lg font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{desc}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((t) => (
          <span key={t} className={`text-xs font-mono px-2 py-0.5 rounded bg-${color}/10 text-${color}`}>{t}</span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-sm text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        开始转换 <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex gap-3 items-start">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h3 className="font-mono text-sm font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function FlowItem({ step, title, from, to, note }: { step: string; title: string; from: string; to: string; note: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-primary/10 text-primary font-mono text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{step}</span>
      <div className="flex-1">
        <span className="font-medium text-foreground">{title}：</span>
        <span className="text-muted-foreground">{from}</span>
        <ArrowRight className="inline w-3 h-3 mx-1 text-primary" />
        <span className="text-primary">{to}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{note}</p>
      </div>
    </div>
  );
}
