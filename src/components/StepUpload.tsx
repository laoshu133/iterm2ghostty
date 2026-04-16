import { useState, useCallback } from "react";
import { Upload, FileJson, FileCode, AlertCircle } from "lucide-react";
import { parseITerm2ProfileJSON, type ITerm2Profile } from "@/lib/iterm2-parser";
import { parseP10kConfig, type P10kConfig } from "@/lib/p10k-parser";
import type { MigrationMode } from "./StepSelectMode";

interface StepUploadProps {
  mode: MigrationMode;
  onParsedITerm2?: (profile: ITerm2Profile) => void;
  onParsedP10k?: (config: P10kConfig) => void;
  onNext: () => void;
  itermProfile?: ITerm2Profile | null;
  p10kConfig?: P10kConfig | null;
}

export function StepUpload({ mode, onParsedITerm2, onParsedP10k, onNext, itermProfile, p10kConfig }: StepUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const needsITerm2 = mode === "iterm2" || mode === "both";
  const needsP10k = mode === "p10k" || mode === "both";
  const canProceed =
    (needsITerm2 ? !!itermProfile : true) && (needsP10k ? !!p10kConfig : true);

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      <h2 className="text-2xl font-mono font-bold mb-2 text-center">上传配置文件</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">
        {mode === "both" ? "分别上传两个配置文件" : mode === "iterm2" ? "上传 iTerm2 Profile JSON" : "上传 .p10k.zsh 配置"}
      </p>

      <div className="space-y-6">
        {needsITerm2 && (
          <UploadCard
            title="iTerm2 Profile JSON"
            desc="Preferences → Profiles → Other Actions → Save Profile as JSON"
            accept=".json"
            icon={<FileJson className="w-10 h-10 text-ghost-green" />}
            uploaded={!!itermProfile}
            uploadedLabel={itermProfile?.["Name"] || "Profile 已加载"}
            onFile={async (file) => {
              setError(null);
              try {
                const text = await file.text();
                const profile = parseITerm2ProfileJSON(text);
                if (!profile || typeof profile !== "object") throw new Error("无法识别");
                onParsedITerm2?.(profile);
              } catch (e) {
                setError(e instanceof Error ? e.message : "iTerm2 Profile 解析失败");
              }
            }}
          />
        )}

        {needsP10k && (
          <UploadCard
            title="Powerlevel10k 配置 (.p10k.zsh)"
            desc="通常位于 ~/.p10k.zsh，由 p10k configure 生成"
            accept=".zsh,.sh,.txt"
            icon={<FileCode className="w-10 h-10 text-ghost-amber" />}
            uploaded={!!p10kConfig}
            uploadedLabel={`${p10kConfig?.leftElements.length || 0} 个左侧段, ${p10kConfig?.rightElements.length || 0} 个右侧段`}
            onFile={async (file) => {
              setError(null);
              try {
                const text = await file.text();
                const config = parseP10kConfig(text);
                if (config.leftElements.length === 0 && config.rightElements.length === 0 && Object.keys(config.variables).length === 0) {
                  throw new Error("未找到 POWERLEVEL9K_* 变量，请确认为 .p10k.zsh 文件");
                }
                onParsedP10k?.(config);
              } catch (e) {
                setError(e instanceof Error ? e.message : ".p10k.zsh 解析失败");
              }
            }}
          />
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {canProceed && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onNext}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-border font-mono inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium transition-colors"
          >
            开始转换 →
          </button>
        </div>
      )}

      {/* Help section */}
      {needsP10k && (
        <div className="mt-8 bg-card border border-border rounded-lg p-5">
          <h3 className="font-mono text-sm font-semibold mb-3 text-ghost-amber">如何找到 .p10k.zsh？</h3>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
            <li>该文件通常在 <code className="bg-muted px-1 py-0.5 rounded text-ghost-green">~/.p10k.zsh</code></li>
            <li>在终端运行 <code className="bg-muted px-1 py-0.5 rounded text-ghost-green">ls -la ~/.p10k.zsh</code> 确认文件存在</li>
            <li>如果不存在，可运行 <code className="bg-muted px-1 py-0.5 rounded text-ghost-green">p10k configure</code> 重新生成</li>
            <li>上传该文件即可（注意：文件以 <code className="bg-muted px-1 py-0.5 rounded">.zsh</code> 结尾，如果文件选择器不显示，可改扩展名为 .txt）</li>
          </ol>
        </div>
      )}

      {needsITerm2 && !needsP10k && (
        <div className="mt-8 bg-card border border-border rounded-lg p-5">
          <h3 className="font-mono text-sm font-semibold mb-3 text-ghost-amber">如何导出 iTerm2 Profile？</h3>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
            <li>打开 iTerm2 → <code className="bg-muted px-1 py-0.5 rounded">⌘ + ,</code> 打开设置</li>
            <li>切换到 <strong className="text-foreground">Profiles</strong> 标签页</li>
            <li>在左侧列表选中你要迁移的 Profile</li>
            <li>点击底部 <strong className="text-foreground">Other Actions...</strong> 下拉菜单</li>
            <li>选择 <strong className="text-foreground">Save Profile as JSON</strong></li>
          </ol>
        </div>
      )}
    </div>
  );
}

function UploadCard({
  title,
  desc,
  accept,
  icon,
  uploaded,
  uploadedLabel,
  onFile,
}: {
  title: string;
  desc: string;
  accept: string;
  icon: React.ReactNode;
  uploaded: boolean;
  uploadedLabel: string;
  onFile: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleSelect = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onFile(file);
    };
    input.click();
  }, [accept, onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      onClick={handleSelect}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
        ${uploaded ? "border-primary/50 bg-primary/5" : isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}
      `}
    >
      <div className="flex flex-col items-center gap-2">
        {uploaded ? (
          <>
            <div className="text-primary">{icon}</div>
            <span className="font-mono text-sm text-primary">✓ {uploadedLabel}</span>
            <span className="text-xs text-muted-foreground">点击重新选择</span>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-muted-foreground" />
            <span className="font-mono text-sm text-foreground">{title}</span>
            <span className="text-xs text-muted-foreground">{desc}</span>
          </>
        )}
      </div>
    </div>
  );
}
