import { Download, Copy, Check, Terminal, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ConversionResult } from "@/lib/iterm2-parser";
import type { StarshipConversionResult } from "@/lib/p10k-parser";
import type { MigrationMode } from "./StepSelectMode";

interface StepFinishProps {
  itermResult: ConversionResult | null;
  p10kResult: StarshipConversionResult | null;
  mode: MigrationMode;
}

export function StepFinish({ itermResult, p10kResult, mode }: StepFinishProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCmd = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      <h2 className="text-2xl font-mono font-bold mb-2 text-center gradient-text">迁移完成 🎉</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">按照以下步骤完成最终配置</p>

      {/* Download buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {itermResult && (
          <Button onClick={() => handleDownload(itermResult.config, "config")} size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-border font-mono">
            <Download className="w-4 h-4" /> 下载 Ghostty 配置
          </Button>
        )}
        {p10kResult && (
          <Button onClick={() => handleDownload(p10kResult.config, "starship.toml")} size="lg" className="gap-2 bg-ghost-amber text-background hover:bg-ghost-amber/90 font-mono">
            <Download className="w-4 h-4" /> 下载 Starship 配置
          </Button>
        )}
      </div>

      {/* Step 1: Install Ghostty */}
      {(mode === "iterm2" || mode === "both") && (
        <>
          <Section icon={<Terminal className="w-4 h-4 text-ghost-green" />} title="安装 Ghostty" step="1">
            <CodeBlock id="install-ghostty" cmd="brew install --cask ghostty" onCopy={copyCmd} copied={copied} />
          </Section>

          <Section icon={<Package className="w-4 h-4 text-ghost-blue" />} title="放置 Ghostty 配置文件" step="2">
            <p className="text-xs text-muted-foreground mb-3">
              将下载的 <code className="bg-muted px-1 py-0.5 rounded text-ghost-green">config</code> 文件放到以下目录：
            </p>
            <CodeBlock
              id="place-config"
              cmd={`mkdir -p ~/.config/ghostty\nmv ~/Downloads/config ~/.config/ghostty/config`}
              onCopy={copyCmd}
              copied={copied}
            />
          </Section>
        </>
      )}

      {/* Starship setup */}
      {(mode === "p10k" || mode === "both") && (
        <>
          <Section
            icon={<Star className="w-4 h-4 text-ghost-amber" />}
            title="安装 Starship（替代 Powerlevel10k）"
            step={mode === "both" ? "3" : "1"}
          >
            <CodeBlock id="install-starship" cmd="brew install starship" onCopy={copyCmd} copied={copied} />
            <p className="text-xs text-muted-foreground mt-3 mb-2">
              在 <code className="bg-muted px-1 py-0.5 rounded text-xs">~/.zshrc</code> 末尾添加：
            </p>
            <CodeBlock id="init-starship" cmd='eval "$(starship init zsh)"' onCopy={copyCmd} copied={copied} />
          </Section>

          <Section
            icon={<Package className="w-4 h-4 text-ghost-amber" />}
            title="放置 Starship 配置"
            step={mode === "both" ? "4" : "2"}
          >
            <p className="text-xs text-muted-foreground mb-3">
              将下载的 <code className="bg-muted px-1 py-0.5 rounded text-ghost-amber">starship.toml</code> 放到：
            </p>
            <CodeBlock
              id="place-starship"
              cmd={`mkdir -p ~/.config\nmv ~/Downloads/starship.toml ~/.config/starship.toml`}
              onCopy={copyCmd}
              copied={copied}
            />
          </Section>

          <Section
            icon={<Terminal className="w-4 h-4 text-destructive" />}
            title="移除 Powerlevel10k（可选）"
            step={mode === "both" ? "5" : "3"}
          >
            <p className="text-xs text-muted-foreground mb-3">确认 Starship 正常工作后：</p>
            <CodeBlock
              id="remove-p10k"
              cmd={`# 从 ~/.zshrc 中删除 p10k 相关行：\n# source ~/powerlevel10k/powerlevel10k.zsh-theme\n# [[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh\n\n# 删除 p10k 目录\nrm -rf ~/powerlevel10k ~/.p10k.zsh`}
              onCopy={copyCmd}
              copied={copied}
            />
          </Section>
        </>
      )}

      {/* Sheldon (plugin manager) */}
      <Section
        icon={<Package className="w-4 h-4 text-ghost-purple" />}
        title="安装 Sheldon（替代 Oh My Zsh 插件管理，可选）"
        step={mode === "both" ? "6" : mode === "p10k" ? "4" : "3"}
      >
        <CodeBlock id="install-sheldon" cmd="brew install sheldon" onCopy={copyCmd} copied={copied} />
        <p className="text-xs text-muted-foreground mt-3 mb-2">初始化并添加常用插件：</p>
        <CodeBlock
          id="sheldon-config"
          cmd={`sheldon init --shell zsh\n# 编辑 ~/.config/sheldon/plugins.toml 添加插件：\n# [plugins.zsh-autosuggestions]\n# github = "zsh-users/zsh-autosuggestions"\n# [plugins.zsh-syntax-highlighting]\n# github = "zsh-users/zsh-syntax-highlighting"`}
          onCopy={copyCmd}
          copied={copied}
        />
        <p className="text-xs text-muted-foreground mt-3 mb-2">
          在 <code className="bg-muted px-1 py-0.5 rounded text-xs">~/.zshrc</code> 中加载：
        </p>
        <CodeBlock id="sheldon-source" cmd='eval "$(sheldon source)"' onCopy={copyCmd} copied={copied} />
      </Section>

      <div className="mt-10 text-center text-xs text-muted-foreground">
        <p>重启终端后即可体验全新配置 ✨</p>
      </div>
    </div>
  );
}

function Section({ icon, title, step, children }: { icon: React.ReactNode; title: string; step: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-primary/10 text-primary font-mono text-xs w-5 h-5 rounded-full flex items-center justify-center">{step}</span>
        {icon}
        <h3 className="font-mono text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ id, cmd, onCopy, copied }: { id: string; cmd: string; onCopy: (id: string, cmd: string) => void; copied: string | null }) {
  return (
    <div className="bg-background border border-border rounded-md flex items-start justify-between gap-2 p-3">
      <pre className="text-xs font-mono text-ghost-green overflow-x-auto flex-1 whitespace-pre-wrap">{cmd}</pre>
      <button onClick={() => onCopy(id, cmd)} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
        {copied === id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
