import { Download, Copy, Check, Terminal, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ConversionResult } from "@/lib/iterm2-parser";

interface StepFinishProps {
  result: ConversionResult;
}

export function StepFinish({ result }: StepFinishProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleDownload = () => {
    const blob = new Blob([result.config], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config";
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

      <div className="flex justify-center mb-8">
        <Button onClick={handleDownload} size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-border font-mono">
          <Download className="w-4 h-4" /> 下载 Ghostty 配置文件
        </Button>
      </div>

      {/* Step 1: Install Ghostty */}
      <Section icon={<Terminal className="w-4 h-4 text-ghost-green" />} title="第一步：安装 Ghostty" step="1">
        <CodeBlock id="install-ghostty" cmd="brew install --cask ghostty" onCopy={copyCmd} copied={copied} />
      </Section>

      {/* Step 2: Place config */}
      <Section icon={<Package className="w-4 h-4 text-ghost-blue" />} title="第二步：放置配置文件" step="2">
        <p className="text-xs text-muted-foreground mb-3">
          将下载的 <code className="bg-muted px-1 py-0.5 rounded text-ghost-green">config</code> 文件放到以下目录：
        </p>
        <CodeBlock
          id="place-config"
          cmd={`mkdir -p ~/.config/ghostty\nmv ~/Downloads/config ~/.config/ghostty/config`}
          onCopy={copyCmd}
          copied={copied}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Ghostty 也支持 <code className="bg-muted px-1 py-0.5 rounded text-xs">~/Library/Application Support/com.mitchellh.ghostty/config</code>
        </p>
      </Section>

      {/* Step 3: Replace Oh My Zsh */}
      <Section icon={<Star className="w-4 h-4 text-ghost-amber" />} title="第三步：安装 Starship（替代 Oh My Zsh 主题）" step="3">
        <CodeBlock id="install-starship" cmd="brew install starship" onCopy={copyCmd} copied={copied} />
        <p className="text-xs text-muted-foreground mt-3 mb-2">
          在 <code className="bg-muted px-1 py-0.5 rounded text-xs">~/.zshrc</code> 末尾添加：
        </p>
        <CodeBlock id="init-starship" cmd='eval "$(starship init zsh)"' onCopy={copyCmd} copied={copied} />
        <p className="text-xs text-muted-foreground mt-2">
          配置文件：<code className="bg-muted px-1 py-0.5 rounded text-ghost-green text-xs">~/.config/starship.toml</code>
        </p>
      </Section>

      {/* Step 4: Plugin manager */}
      <Section icon={<Package className="w-4 h-4 text-ghost-purple" />} title="第四步：安装 Sheldon（替代 Oh My Zsh 插件管理）" step="4">
        <CodeBlock id="install-sheldon" cmd="brew install sheldon" onCopy={copyCmd} copied={copied} />
        <p className="text-xs text-muted-foreground mt-3 mb-2">
          初始化并添加常用插件：
        </p>
        <CodeBlock
          id="sheldon-config"
          cmd={`sheldon init --shell zsh
# 编辑 ~/.config/sheldon/plugins.toml 添加插件，例如：
# [plugins.zsh-autosuggestions]
# github = "zsh-users/zsh-autosuggestions"
# [plugins.zsh-syntax-highlighting]
# github = "zsh-users/zsh-syntax-highlighting"
# [plugins.zsh-completions]
# github = "zsh-users/zsh-completions"`}
          onCopy={copyCmd}
          copied={copied}
        />
        <p className="text-xs text-muted-foreground mt-3 mb-2">
          在 <code className="bg-muted px-1 py-0.5 rounded text-xs">~/.zshrc</code> 中加载 Sheldon：
        </p>
        <CodeBlock id="sheldon-source" cmd='eval "$(sheldon source)"' onCopy={copyCmd} copied={copied} />
      </Section>

      {/* Step 5: Clean up */}
      <Section icon={<Terminal className="w-4 h-4 text-destructive" />} title="第五步：移除 Oh My Zsh（可选）" step="5">
        <p className="text-xs text-muted-foreground mb-3">
          确认一切正常后，可以卸载 Oh My Zsh：
        </p>
        <CodeBlock id="remove-omz" cmd="uninstall_oh_my_zsh" onCopy={copyCmd} copied={copied} />
        <p className="text-xs text-muted-foreground mt-2">
          同时删除 <code className="bg-muted px-1 py-0.5 rounded text-xs">~/.zshrc</code> 中的 
          <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1">source $ZSH/oh-my-zsh.sh</code> 相关行。
        </p>
      </Section>

      <div className="mt-10 text-center text-xs text-muted-foreground">
        <p>打开 Ghostty 按 <code className="bg-muted px-1.5 py-0.5 rounded text-ghost-green">⌘ + ,</code> 随时编辑配置</p>
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
      <button
        onClick={() => onCopy(id, cmd)}
        className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
      >
        {copied === id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
