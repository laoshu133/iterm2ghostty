import { useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { StepOverview } from "@/components/StepOverview";
import { StepSelectMode, type MigrationMode } from "@/components/StepSelectMode";
import { StepUpload } from "@/components/StepUpload";
import { StepConvert } from "@/components/StepConvert";
import { StepConvertP10k } from "@/components/StepConvertP10k";
import { StepFinish } from "@/components/StepFinish";
import type { ITerm2Profile, ConversionResult } from "@/lib/iterm2-parser";
import type { P10kConfig, StarshipConversionResult } from "@/lib/p10k-parser";

function getSteps(mode: MigrationMode | null): string[] {
  if (mode === "both") return ["了解方案", "选择模式", "上传配置", "iTerm2 转换", "P10k 转换", "下载 & 操作"];
  if (mode === "p10k") return ["了解方案", "选择模式", "上传配置", "P10k 转换", "下载 & 操作"];
  return ["了解方案", "选择模式", "上传配置", "转换预览", "下载 & 操作"];
}

export default function Index() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<MigrationMode | null>(null);
  const [profile, setProfile] = useState<ITerm2Profile | null>(null);
  const [p10kConfig, setP10kConfig] = useState<P10kConfig | null>(null);
  const [itermResult, setItermResult] = useState<ConversionResult | null>(null);
  const [p10kResult, setP10kResult] = useState<StarshipConversionResult | null>(null);

  const steps = getSteps(mode);

  const renderStep = () => {
    if (step === 0) return <StepOverview onNext={() => setStep(1)} />;
    if (step === 1) return (
      <StepSelectMode onSelect={(m) => { setMode(m); setStep(2); }} />
    );
    if (step === 2) return (
      <StepUpload
        mode={mode!}
        itermProfile={profile}
        p10kConfig={p10kConfig}
        onParsedITerm2={(p) => setProfile(p)}
        onParsedP10k={(c) => setP10kConfig(c)}
        onNext={() => setStep(3)}
      />
    );

    if (mode === "iterm2") {
      if (step === 3 && profile) return (
        <StepConvert profile={profile} onNext={(r) => { setItermResult(r); setStep(4); }} />
      );
      if (step === 4 && itermResult) return (
        <StepFinish itermResult={itermResult} p10kResult={null} mode={mode} />
      );
    }

    if (mode === "p10k") {
      if (step === 3 && p10kConfig) return (
        <StepConvertP10k config={p10kConfig} onNext={(r) => { setP10kResult(r); setStep(4); }} />
      );
      if (step === 4 && p10kResult) return (
        <StepFinish itermResult={null} p10kResult={p10kResult} mode={mode} />
      );
    }

    if (mode === "both") {
      if (step === 3 && profile) return (
        <StepConvert profile={profile} onNext={(r) => { setItermResult(r); setStep(4); }} />
      );
      if (step === 4 && p10kConfig) return (
        <StepConvertP10k config={p10kConfig} onNext={(r) => { setP10kResult(r); setStep(5); }} />
      );
      if (step === 5 && itermResult) return (
        <StepFinish itermResult={itermResult} p10kResult={p10kResult} mode={mode} />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen terminal-grid">
      <div className="container max-w-4xl py-12 px-4">
        <StepIndicator steps={steps} currentStep={step} />
        {renderStep()}
      </div>
    </div>
  );
}
