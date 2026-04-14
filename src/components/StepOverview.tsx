import { ArrowRight, Zap, Terminal, Puzzle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepOverviewProps {
  onNext: () => void;
}

export function StepOverview({ onNext }: StepOverviewProps) {
  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-mono font-bold mb-4 tracking-tight">
          <span className="gradient-text">iTerm2 → Ghostty</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          将你的 iTerm2 + Oh My Zsh 配置无缝迁移到现代化的 Ghostty 终端
        </p>
      </div>

      {/* Why Ghostty */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <InfoCard
          icon={<Zap className="w-5 h-5 text-ghost-amber" />}
          title="GPU 加速渲染"
          desc="基于 Metal/Vulkan，比 iTerm2 快数倍"
        />
        <InfoCard
          icon={<Terminal className="w-5 h-5 text-ghost-green" />}
          title="原生体验"
          desc="macOS SwiftUI 原生 UI，Linux GTK 原生"
        />
        <InfoCard
          icon={<Puzzle className="w-5 h-5 text-ghost-purple" />}
          title="纯文本配置"
          desc="告别 plist/JSON，一个 config 文件搞定一切"
        />
        <InfoCard
          icon={<Rocket className="w-5 h-5 text-ghost-blue" />}
          title="现代生态"
          desc="搭配 Starship + Sheldon 取代 Oh My Zsh"
        />
      </div>

      {/* Migration flow */}
      <div className="bg-card rounded-lg border border-border p-6 mb-10">
        <h2 className="font-mono text-lg mb-4 text-primary">迁移方案</h2>
        <div className="space-y-4 text-sm">
          <FlowItem step="1" title="终端模拟器" from="iTerm2" to="Ghostty" note="本工具自动转换配置" />
          <FlowItem step="2" title="Shell 框架" from="Oh My Zsh" to="Starship + 原生 Zsh" note="Starship 替代主题，原生 Zsh 完成补全" />
          <FlowItem step="3" title="插件管理" from="Oh My Zsh 内置" to="Sheldon / zinit" note="更快的插件加载，按需启用" />
        </div>
      </div>

      {/* Architecture explanation */}
      <div className="bg-card rounded-lg border border-border p-6 mb-10">
        <h2 className="font-mono text-lg mb-4 text-primary">工作原理</h2>
        <div className="space-y-3 text-sm text-secondary-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">iTerm2</strong> 将配置存储在 
            <code className="bg-muted px-1.5 py-0.5 rounded text-ghost-green text-xs">~/Library/Preferences/com.googlecode.iterm2.plist</code> 中，
            Profile 可导出为 JSON 格式，包含字体、颜色方案、快捷键等信息。
          </p>
          <p>
            <strong className="text-foreground">Ghostty</strong> 使用纯文本配置文件 
            <code className="bg-muted px-1.5 py-0.5 rounded text-ghost-green text-xs">~/.config/ghostty/config</code>，
            采用 <code className="bg-muted px-1.5 py-0.5 rounded text-xs">key = value</code> 格式，支持主题继承和多配置。
          </p>
          <p>
            <strong className="text-foreground">Oh My Zsh</strong> 是 Zsh 的框架，提供主题和插件管理。但它的启动开销较大（200-500ms）。
            <strong className="text-foreground"> Starship</strong>（Rust 编写的跨 Shell 提示符）可替代其主题功能，
            <strong className="text-foreground"> Sheldon</strong> 则是高性能的插件管理器，两者组合启动速度 &lt; 50ms。
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          size="lg"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-border font-mono"
        >
          开始迁移 <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex gap-3 items-start hover:border-primary/30 transition-colors">
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
