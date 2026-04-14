import { useMemo } from "react";
import { ArrowRight, Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { convertITerm2ToGhostty, type ITerm2Profile, type ConversionResult } from "@/lib/iterm2-parser";

interface StepConvertProps {
  profile: ITerm2Profile;
  onNext: (result: ConversionResult) => void;
}

export function StepConvert({ profile, onNext }: StepConvertProps) {
  const result = useMemo(() => convertITerm2ToGhostty(profile), [profile]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      <h2 className="text-2xl font-mono font-bold mb-2 text-center">配置转换完成</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">
        已从 iTerm2 Profile 中提取 {result.mappings.length} 项配置
      </p>

      {/* Mappings table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
        <div className="p-3 border-b border-border bg-muted/30">
          <h3 className="font-mono text-sm text-primary">配置映射</h3>
        </div>
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left p-2 font-medium">配置项</th>
                <th className="text-left p-2 font-medium">iTerm2</th>
                <th className="text-left p-2 font-medium">Ghostty</th>
              </tr>
            </thead>
            <tbody>
              {result.mappings.slice(0, 20).map((m, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="p-2 font-mono text-foreground">{m.key}</td>
                  <td className="p-2 text-muted-foreground">{m.iterm2Value}</td>
                  <td className="p-2 text-primary">{m.ghosttyValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs p-2 bg-ghost-amber/10 border border-ghost-amber/20 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-ghost-amber shrink-0 mt-0.5" />
              <span className="text-ghost-amber">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Config preview */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="font-mono text-sm text-ghost-green">~/.config/ghostty/config</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-1 text-xs h-7"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "已复制" : "复制"}
          </Button>
        </div>
        <pre className="p-4 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto text-secondary-foreground leading-relaxed">
          {result.config}
        </pre>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => onNext(result)}
          size="lg"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-border font-mono"
        >
          下载配置 & 查看操作步骤 <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
