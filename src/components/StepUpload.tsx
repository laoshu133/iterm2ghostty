import { useState, useCallback } from "react";
import { Upload, FileJson, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseITerm2ProfileJSON, type ITerm2Profile } from "@/lib/iterm2-parser";

interface StepUploadProps {
  onParsed: (profile: ITerm2Profile) => void;
}

export function StepUpload({ onParsed }: StepUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);
      try {
        const text = await file.text();
        const profile = parseITerm2ProfileJSON(text);
        if (!profile || typeof profile !== "object") {
          throw new Error("无法识别的文件格式");
        }
        onParsed(profile);
      } catch (e) {
        setError(e instanceof Error ? e.message : "文件解析失败，请确认为 iTerm2 Profile JSON");
      }
    },
    [onParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSelect = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <div className="animate-slide-up max-w-2xl mx-auto">
      <h2 className="text-2xl font-mono font-bold mb-2 text-center">上传 iTerm2 配置</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">
        在 iTerm2 中：Preferences → Profiles → 选择配置 → Other Actions → Save Profile as JSON
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={handleSelect}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}
        `}
      >
        {fileName ? (
          <div className="flex flex-col items-center gap-3">
            <FileJson className="w-12 h-12 text-primary" />
            <span className="font-mono text-sm text-primary">{fileName}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">拖拽或点击选择 iTerm2 Profile JSON 文件</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-8 bg-card border border-border rounded-lg p-5">
        <h3 className="font-mono text-sm font-semibold mb-3 text-ghost-amber">如何导出 iTerm2 Profile？</h3>
        <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
          <li>打开 iTerm2 → <code className="bg-muted px-1 py-0.5 rounded">⌘ + ,</code> 打开设置</li>
          <li>切换到 <strong className="text-foreground">Profiles</strong> 标签页</li>
          <li>在左侧列表选中你要迁移的 Profile</li>
          <li>点击底部 <strong className="text-foreground">Other Actions...</strong> 下拉菜单</li>
          <li>选择 <strong className="text-foreground">Save Profile as JSON</strong></li>
          <li>保存文件后上传到此处</li>
        </ol>
      </div>
    </div>
  );
}
